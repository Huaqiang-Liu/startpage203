/* tslint:disable */
/* eslint-disable */
/**
*/
export function test_wasm(): void;
/**
* @param {number} fnmode
*/
export function init_page(fnmode: number): void;
/**
* @param {string} data_str
* @returns {Uint8Array}
*/
export function str_to_bytes(data_str: string): Uint8Array;
/**
* @param {Uint8Array} data
* @returns {string}
*/
export function bytes_to_str(data: Uint8Array): string;
/**
* @param {string} pub_key_str
* @returns {string}
*/
export function encrypt_aes_by_rsa(pub_key_str: string): string;
/**
* @returns {string}
*/
export function rsa_pub_key_to_string(): string;
/**
* @param {string} encrypted_aes_str
*/
export function str_to_aes(encrypted_aes_str: string): void;
/**
* @returns {boolean}
*/
export function check_data(): boolean;
/**
* @param {Uint8Array} data
* @returns {Uint8Array}
*/
export function encrypt_by_aes(data: Uint8Array): Uint8Array;
/**
* @param {Uint8Array} data
* @returns {Uint8Array}
*/
export function decrypt_by_aes(data: Uint8Array): Uint8Array;
/**
* @param {Uint8Array} background_data
* @param {Uint8Array} qrcode_data
* @returns {Uint8Array}
*/
export function merge_image(background_data: Uint8Array, qrcode_data: Uint8Array): Uint8Array;
/**
* @param {Uint8Array} file_data
* @param {number} mode
* @param {number} ratio
* @param {number} size
* @returns {Uint8Array}
*/
export function process_image(file_data: Uint8Array, mode: number, ratio: number, size: number): Uint8Array;
/**
*/
export function save_favor_sites_to_file(): void;
/**
* @returns {any}
*/
export function load_favor_sites_from_file(): any;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly test_wasm: () => void;
  readonly init_page: (a: number) => void;
  readonly str_to_bytes: (a: number, b: number, c: number) => void;
  readonly bytes_to_str: (a: number, b: number, c: number) => void;
  readonly encrypt_aes_by_rsa: (a: number, b: number, c: number) => void;
  readonly rsa_pub_key_to_string: (a: number) => void;
  readonly str_to_aes: (a: number, b: number) => void;
  readonly check_data: () => number;
  readonly encrypt_by_aes: (a: number, b: number, c: number) => void;
  readonly decrypt_by_aes: (a: number, b: number, c: number) => void;
  readonly merge_image: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly process_image: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly save_favor_sites_to_file: () => void;
  readonly load_favor_sites_from_file: () => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
