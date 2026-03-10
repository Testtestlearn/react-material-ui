import { Box, Button, Stack, Typography } from "@mui/material";
import * as go from "gojs";
import { useEffect, useRef } from "react";
import { Link as RouterLink } from "react-router-dom";

// ── constants ──────────────────────────────────────────────────────────────────
const MINLENGTH = 200; // minimum length of any swimlane
const MINBREADTH = 20; // minimum breadth of any non-collapsed swimlane

// ── helpers ────────────────────────────────────────────────────────────────────
function relayoutLanes(diagram: go.Diagram) {
  diagram.nodes.each((lane) => {
    if (!(lane instanceof go.Group)) return;
    if (lane.category === "Pool") return;
    (lane.layout as go.Layout).isValidLayout = false;
  });
  diagram.layoutDiagram();
}

function relayoutDiagram(diagram: go.Diagram) {
  diagram.layout.invalidateLayout();
  diagram.findTopLevelGroups().each((g) => {
    if (g.category === "Pool") g.layout?.invalidateLayout();
  });
  diagram.layoutDiagram();
}

function computeMinPoolSize(pool: go.Group): go.Size {
  let len = MINLENGTH;
  pool.memberParts.each((lane) => {
    if (!(lane instanceof go.Group)) return;
    const holder = lane.placeholder;
    if (holder !== null) len = Math.max(len, holder.actualBounds.width);
  });
  return new go.Size(len, NaN);
}

function computeMinLaneSize(lane: go.Group): go.Size {
  if (!lane.isSubGraphExpanded) return new go.Size(MINLENGTH, 1);
  return new go.Size(MINLENGTH, MINBREADTH);
}

function computeLaneSize(lane: go.Group): go.Size {
  const sz = computeMinLaneSize(lane);
  if (lane.isSubGraphExpanded) {
    const holder = lane.placeholder;
    if (holder !== null)
      sz.height = Math.ceil(Math.max(sz.height, holder.actualBounds.height));
  }
  const hdr = lane.findObject("HEADER");
  if (hdr !== null)
    sz.height = Math.ceil(Math.max(sz.height, hdr.actualBounds.height));
  return sz;
}

// ── custom ResizingTool ────────────────────────────────────────────────────────
class LaneResizingTool extends go.ResizingTool {
  isLengthening(): boolean {
    return this.handle!.alignment === go.Spot.Right;
  }

  override computeMinSize(): go.Size {
    const lane = this.adornedObject!.part as go.Group;
    const msz = computeMinLaneSize(lane);
    if (this.isLengthening()) {
      const sz = computeMinPoolSize(lane.containingGroup as go.Group);
      msz.width = Math.max(msz.width, sz.width);
    } else {
      const sz = computeLaneSize(lane);
      msz.width = Math.max(msz.width, sz.width);
      msz.height = Math.max(msz.height, sz.height);
    }
    return msz;
  }

  override resize(newr: go.Rect): void {
    const lane = this.adornedObject!.part as go.Group;
    if (this.isLengthening()) {
      lane.containingGroup!.memberParts.each((l) => {
        if (!(l instanceof go.Group)) return;
        const shape = l.resizeObject;
        if (shape !== null) shape.width = newr.width;
      });
    } else {
      super.resize(newr);
    }
    relayoutDiagram(this.diagram!);
  }
}

// ── custom PoolLayout ──────────────────────────────────────────────────────────
class PoolLayout extends go.GridLayout {
  constructor(init?: Partial<go.GridLayout>) {
    super();
    this.cellSize = new go.Size(1, 1);
    this.wrappingColumn = 1;
    this.wrappingWidth = Infinity;
    this.isRealtime = false;
    this.alignment = go.GridAlignment.Position;
    this.comparer = (a, b) => {
      const ay = a.location.y;
      const by = b.location.y;
      if (isNaN(ay) || isNaN(by)) return 0;
      if (ay < by) return -1;
      if (ay > by) return 1;
      return 0;
    };
    this.boundsComputation = (part, _layout, rect) => {
      part.getDocumentBounds(rect);
      rect.inflate(-1, -1);
      return rect;
    };
    if (init) Object.assign(this, init);
  }

  override doLayout(coll: go.Diagram | go.Group | go.Iterable<go.Part>): void {
    const diagram = this.diagram;
    if (diagram === null) return;
    diagram.startTransaction("PoolLayout");
    const pool = this.group;
    if (pool !== null && pool.category === "Pool") {
      const minsize = computeMinPoolSize(pool);
      pool.memberParts.each((lane) => {
        if (!(lane instanceof go.Group)) return;
        if (lane.category !== "Pool") {
          const shape = lane.resizeObject;
          if (shape !== null) {
            const sz = computeLaneSize(lane);
            shape.width = isNaN(shape.width)
              ? minsize.width
              : Math.max(shape.width, minsize.width);
            shape.height = !isNaN(shape.height)
              ? Math.max(shape.height, sz.height)
              : sz.height;
            const cell = lane.resizeCellSize;
            if (!isNaN(shape.width) && !isNaN(cell.width) && cell.width > 0)
              shape.width = Math.ceil(shape.width / cell.width) * cell.width;
            if (!isNaN(shape.height) && !isNaN(cell.height) && cell.height > 0)
              shape.height =
                Math.ceil(shape.height / cell.height) * cell.height;
          }
        }
      });
    }
    super.doLayout(coll);
    diagram.commitTransaction("PoolLayout");
  }
}

// ── node / link data ──────────────────────────────────────────────────────────
const nodeDataArray = [
  { key: "Pool1", text: "Pool", isGroup: true, category: "Pool" },
  { key: "Pool2", text: "Pool2", isGroup: true, category: "Pool" },
  {
    key: "Lane1",
    text: "Lane1",
    isGroup: true,
    category: "Lane",
    group: "Pool1",
    color: "lightblue",
  },
  {
    key: "Lane2",
    text: "Lane2",
    isGroup: true,
    category: "Lane",
    group: "Pool1",
    color: "lightgreen",
  },
  {
    key: "Lane3",
    text: "Lane3",
    isGroup: true,
    category: "Lane",
    group: "Pool1",
    color: "lightyellow",
  },
  {
    key: "Lane4",
    text: "Lane4",
    isGroup: true,
    category: "Lane",
    group: "Pool1",
    color: "orange",
  },
  { key: "oneA", group: "Lane1" },
  { key: "oneB", group: "Lane1" },
  { key: "oneC", group: "Lane1" },
  { key: "oneD", group: "Lane1" },
  { key: "twoA", group: "Lane2" },
  { key: "twoB", group: "Lane2" },
  { key: "twoC", group: "Lane2" },
  { key: "twoD", group: "Lane2" },
  { key: "twoE", group: "Lane2" },
  { key: "twoF", group: "Lane2" },
  { key: "twoG", group: "Lane2" },
  { key: "fourA", group: "Lane4" },
  { key: "fourB", group: "Lane4" },
  { key: "fourC", group: "Lane4" },
  { key: "fourD", group: "Lane4" },
  {
    key: "Lane5",
    text: "Lane5",
    isGroup: true,
    category: "Lane",
    group: "Pool2",
    color: "lightyellow",
  },
  {
    key: "Lane6",
    text: "Lane6",
    isGroup: true,
    category: "Lane",
    group: "Pool2",
    color: "lightgreen",
  },
  { key: "fiveA", group: "Lane5" },
  { key: "sixA", group: "Lane6" },
];

const linkDataArray = [
  { from: "oneA", to: "oneB" },
  { from: "oneA", to: "oneC" },
  { from: "oneB", to: "oneD" },
  { from: "oneC", to: "oneD" },
  { from: "twoA", to: "twoB" },
  { from: "twoA", to: "twoC" },
  { from: "twoA", to: "twoF" },
  { from: "twoB", to: "twoD" },
  { from: "twoC", to: "twoD" },
  { from: "twoD", to: "twoG" },
  { from: "twoE", to: "twoG" },
  { from: "twoF", to: "twoG" },
  { from: "fourA", to: "fourB" },
  { from: "fourB", to: "fourC" },
  { from: "fourC", to: "fourD" },
];

// ── React component ───────────────────────────────────────────────────────────
function SwimLanesPage() {
  const divRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<go.Diagram | null>(null);

  useEffect(() => {
    if (!divRef.current) return;

    // ── diagram init ──────────────────────────────────────────────────────────
    const diagram = new go.Diagram(divRef.current, {
      resizingTool: new LaneResizingTool(),
      layout: new PoolLayout(),
      mouseDragOver: (e) => {
        if (!e.diagram.selection.all((n) => n instanceof go.Group))
          e.diagram.currentCursor = "not-allowed";
      },
      mouseDrop: (e) => {
        if (!e.diagram.selection.all((n) => n instanceof go.Group))
          e.diagram.currentTool.doCancel();
      },
      "commandHandler.copiesGroupKey": true,
      SelectionMoved: (e) => relayoutDiagram(e.diagram),
      SelectionCopied: (e) => relayoutDiagram(e.diagram),
      "animationManager.isEnabled": false,
      "undoManager.isEnabled": true,
    });

    diagramRef.current = diagram;

    // ── drag-within-group constraint ──────────────────────────────────────────
    function stayInGroup(
      part: go.Part,
      pt: go.Point,
      _gridpt: go.Point,
    ): go.Point {
      const grp = part.containingGroup;
      if (grp === null) return pt;
      const back = grp.resizeObject;
      if (back === null) return pt;
      if (part.diagram!.lastInput.shift) return pt;
      const r = back.getDocumentBounds();
      const b = part.actualBounds;
      const loc = part.location;
      const m = grp.placeholder!.padding as go.Margin;
      const x =
        Math.max(
          r.x + m.left,
          Math.min(pt.x, r.right - m.right - b.width - 1),
        ) +
        (loc.x - b.x);
      const y =
        Math.max(
          r.y + m.top,
          Math.min(pt.y, r.bottom - m.bottom - b.height - 1),
        ) +
        (loc.y - b.y);
      return new go.Point(x, y);
    }

    // ── node template ─────────────────────────────────────────────────────────
    diagram.nodeTemplate = new go.Node("Auto", {
      dragComputation: stayInGroup,
    })
      .bindTwoWay("location", "loc", go.Point.parse, go.Point.stringify)
      .add(
        new go.Shape("Rectangle", {
          fill: "white",
          portId: "",
          cursor: "pointer",
          fromLinkable: true,
          toLinkable: true,
        }),
        new go.TextBlock({ margin: 5 }).bind("text", "key"),
      );

    // ── group style helper ────────────────────────────────────────────────────
    function groupStyle(grp: go.Group) {
      grp.layerName = "Background";
      grp.background = "transparent";
      grp.movable = true;
      grp.copyable = false;
      grp.avoidable = false;
      grp.minLocation = new go.Point(NaN, -Infinity);
      grp.maxLocation = new go.Point(NaN, Infinity);
      grp.bindTwoWay("location", "loc", go.Point.parse, go.Point.stringify);
    }

    function updateCrossLaneLinks(group: go.Group) {
      group.findExternalLinksConnected().each((l) => {
        l.visible = l.fromNode!.isVisible() && l.toNode!.isVisible();
      });
    }

    // ── Lane group template ───────────────────────────────────────────────────
    diagram.groupTemplateMap.add(
      "Lane",
      new go.Group("Horizontal")
        .apply(groupStyle)
        .set({
          selectionObjectName: "SHAPE",
          resizable: true,
          resizeObjectName: "SHAPE",
          layout: new go.LayeredDigraphLayout({
            isInitial: false,
            isOngoing: false,
            direction: 0,
            columnSpacing: 10,
            layeringOption: go.LayeredDigraphLayering.LongestPathSource,
          }),
          computesBoundsAfterDrag: true,
          computesBoundsIncludingLinks: false,
          computesBoundsIncludingLocation: true,
          handlesDragDropForMembers: true,
          mouseDrop: (e, grp) => {
            if (!e.shift) return;
            if (!e.diagram.selection.any((n) => n instanceof go.Group)) {
              const ok = (grp as go.Group).addMembers(
                grp.diagram!.selection,
                true,
              );
              if (ok) updateCrossLaneLinks(grp as go.Group);
              else grp.diagram!.currentTool.doCancel();
            } else {
              e.diagram.currentTool.doCancel();
            }
          },
          subGraphExpandedChanged: (grp) => {
            const laneGrp = grp as go.Group;
            const shp = laneGrp.resizeObject;
            if (laneGrp.diagram!.undoManager.isUndoingRedoing) return;
            if (laneGrp.isSubGraphExpanded) {
              shp.height = (
                laneGrp.data as { savedBreadth: number }
              ).savedBreadth;
            } else {
              if (!isNaN(shp.height))
                laneGrp.diagram!.model.set(
                  laneGrp.data,
                  "savedBreadth",
                  shp.height,
                );
              shp.height = NaN;
            }
            updateCrossLaneLinks(laneGrp);
          },
        })
        .bindTwoWay("location", "loc", go.Point.parse, go.Point.stringify)
        .bindTwoWay("isSubGraphExpanded", "expanded")
        .add(
          new go.Panel("Horizontal", {
            name: "HEADER",
            angle: 270,
            alignment: go.Spot.Center,
          }).add(
            new go.Panel("Horizontal")
              .bindObject("visible", "isSubGraphExpanded")
              .add(
                new go.Shape("Diamond", {
                  width: 8,
                  height: 8,
                  fill: "white",
                }).bind("fill", "color"),
                new go.TextBlock({
                  font: "bold 13pt sans-serif",
                  editable: true,
                  margin: new go.Margin(2, 0, 0, 0),
                }).bindTwoWay("text"),
              ),
            go.GraphObject.build("SubGraphExpanderButton", { margin: 5 }),
          ),
          new go.Panel("Auto").add(
            new go.Shape("Rectangle", { name: "SHAPE", fill: "white" })
              .bind("fill", "color")
              .bindTwoWay(
                "desiredSize",
                "size",
                go.Size.parse,
                go.Size.stringify,
              ),
            new go.Placeholder({ padding: 12, alignment: go.Spot.TopLeft }),
            new go.TextBlock({
              name: "LABEL",
              font: "bold 13pt sans-serif",
              editable: true,
              angle: 0,
              alignment: go.Spot.TopLeft,
              margin: new go.Margin(2, 0, 0, 4),
            })
              .bindObject("visible", "isSubGraphExpanded", (e) => !e)
              .bindTwoWay("text"),
          ),
        ),
    );

    // resize adornment for Lane
    diagram.groupTemplateMap.get("Lane")!.resizeAdornmentTemplate =
      new go.Adornment("Spot").add(
        new go.Placeholder(),
        new go.Shape({
          alignment: go.Spot.Right,
          desiredSize: new go.Size(7, 50),
          fill: "lightblue",
          stroke: "dodgerblue",
          cursor: "col-resize",
        }).bindObject("visible", "", (ad: go.Adornment) => {
          if (ad.adornedPart === null) return false;
          return (ad.adornedPart as go.Group).isSubGraphExpanded;
        }),
        new go.Shape({
          alignment: go.Spot.Bottom,
          desiredSize: new go.Size(50, 7),
          fill: "lightblue",
          stroke: "dodgerblue",
          cursor: "row-resize",
        }).bindObject("visible", "", (ad: go.Adornment) => {
          if (ad.adornedPart === null) return false;
          return (ad.adornedPart as go.Group).isSubGraphExpanded;
        }),
      );

    // ── Pool group template ───────────────────────────────────────────────────
    diagram.groupTemplateMap.add(
      "Pool",
      new go.Group("Auto")
        .apply(groupStyle)
        .set({
          layout: new PoolLayout({ spacing: new go.Size(0, 0) }),
        })
        .bindTwoWay("location", "loc", go.Point.parse, go.Point.stringify)
        .add(
          new go.Shape({ fill: "white" }).bind("fill", "color"),
          new go.Panel("Table", { defaultColumnSeparatorStroke: "black" }).add(
            new go.Panel("Horizontal", { column: 0, angle: 270 }).add(
              new go.TextBlock({
                font: "bold 16pt sans-serif",
                editable: true,
                margin: new go.Margin(2, 0, 0, 0),
              }).bindTwoWay("text"),
            ),
            new go.Placeholder({ column: 1 }),
          ),
        ),
    );

    // ── link template ─────────────────────────────────────────────────────────
    diagram.linkTemplate = new go.Link({
      routing: go.Routing.AvoidsNodes,
      corner: 5,
      relinkableFrom: true,
      relinkableTo: true,
    }).add(new go.Shape(), new go.Shape({ toArrow: "Standard" }));

    // ── model ─────────────────────────────────────────────────────────────────
    diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);

    relayoutLanes(diagram);

    return () => {
      diagram.div = null;
    };
  }, []);

  return (
    <>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "secondary.light",
          borderRadius: 3,
          p: { xs: 3, md: 5 },
          background:
            "linear-gradient(140deg, #fff6d9 0%, #ffd8b5 50%, #ffc9de 100%)",
          boxShadow: "0 18px 50px rgba(126, 68, 34, 0.22)",
        }}
      >
        <Typography
          variant="overline"
          sx={{
            fontWeight: 800,
            letterSpacing: "0.14em",
            color: "primary.main",
          }}
        >
          GoJS
        </Typography>
        <Typography
          variant="h2"
          sx={{ mt: 1, fontSize: { xs: "2rem", md: "3.4rem" } }}
        >
          Swim Lanes
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 2, maxWidth: "58ch" }}
        >
          Collapsible, resizable, re-orderable swim lanes built with the GoJS
          diagramming library. Drag nodes within lanes, or hold Shift to move
          them between lanes.
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ mt: 3 }}
        >
          <Button variant="outlined" component={RouterLink} to="/">
            Back to Home
          </Button>
          <Button
            variant="contained"
            onClick={() =>
              diagramRef.current && relayoutLanes(diagramRef.current)
            }
          >
            Re-layout
          </Button>
        </Stack>
      </Box>

      <Box
        ref={divRef}
        sx={{
          mt: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          width: "100%",
          height: 700,
        }}
      />
    </>
  );
}

export default SwimLanesPage;
