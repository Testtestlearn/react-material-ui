/// <reference types="node" />
import { TextDecoder, TextEncoder } from 'util';
Object.assign(global, { TextDecoder, TextEncoder });

import '@testing-library/jest-dom';
