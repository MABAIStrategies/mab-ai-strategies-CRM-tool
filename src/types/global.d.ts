type AnyFn = (...args: any[]) => any;

declare namespace JSX {
  interface IntrinsicElements { [elemName: string]: any; }
  interface IntrinsicAttributes { key?: any; }
  interface ElementChildrenAttribute { children: {}; }
}

declare namespace React {
  type ReactNode = any;
  type Ref<T = any> = any;
  type ChangeEvent<T = any> = any;
  type KeyboardEvent<T = any> = any;
  interface HTMLAttributes<T = any> { [key: string]: any; }
  interface InputHTMLAttributes<T = any> extends HTMLAttributes<T> {}
  interface TextareaHTMLAttributes<T = any> extends HTMLAttributes<T> {}
  interface ButtonHTMLAttributes<T = any> extends HTMLAttributes<T> {}
}

declare module "react" {
  export type ReactNode = any;
  export type Ref<T = any> = any;
  export type ChangeEvent<T = any> = any;
  export type KeyboardEvent<T = any> = any;
  export interface HTMLAttributes<T = any> { [key: string]: any; }
  export interface InputHTMLAttributes<T = any> extends HTMLAttributes<T> {}
  export interface TextareaHTMLAttributes<T = any> extends HTMLAttributes<T> {}
  export interface ButtonHTMLAttributes<T = any> extends HTMLAttributes<T> {}
  export function useState<T = any>(initial: T): [T, any];
  export function useEffect(effect: AnyFn, deps?: any[]): void;
  export function useMemo<T = any>(factory: AnyFn, deps?: any[]): T;
  export function useCallback<T extends AnyFn = AnyFn>(callback: T, deps?: any[]): T;
  export function useContext<T = any>(ctx: any): T;
  export function createContext<T = any>(value: T): any;
  export function forwardRef<T = any, P = any>(render: any): any;
  const ReactAny: any;
  export default ReactAny;
}

declare module "react-dom" { const ReactDomAny: any; export default ReactDomAny; }
declare module "next" { export type Metadata = any; const v: any; export default v; }
declare module "next/link" { const v: any; export default v; }
declare module "next/image" { const v: any; export default v; }
declare module "next/navigation" { export const useRouter: any; export const usePathname: any; export const useSearchParams: any; export const useParams: any; export const redirect: any; }
declare module "next/server" { export type NextRequest = any; export const NextRequest: any; export const NextResponse: any; }
declare module "crypto" { const c: any; export default c; }
declare module "@prisma/client" { export class PrismaClient { constructor(...args:any[]); [k:string]: any } export namespace Prisma { type TransactionClient = any; type InputJsonValue = any } export type TaskStatus = any; }
declare module "@tanstack/react-query" { export const QueryClient: any; export const QueryClientProvider: any; }
declare module "zod" { export const z: any; const _default: any; export default _default; }
declare namespace z { type infer<T=any> = any }
declare module "clsx" { export type ClassValue = any; export function clsx(...args: any[]): string; const x: any; export default x; }
declare module "tailwind-merge" { export function twMerge(...args: any[]): string; }
declare module "vitest" { export const describe: any; export const it: any; export const expect: any; export const beforeEach: any; export const vi: any; }
declare module "vitest/config" { export const defineConfig: any; }
declare module "@playwright/test" { export const test: any; export const expect: any; export const defineConfig: any; }
declare module "tailwindcss" { export type Config = any; }
declare module "@radix-ui/react-slot" { export const Slot: any; }
declare module "class-variance-authority" { export const cva: any; export type VariantProps<T=any> = any; }
declare module "lucide-react" {
  export const Archive: any; export const ArrowUpRight: any; export const Layers3: any; export const ShieldCheck: any;
  export const Layers: any; export const Radar: any; export const Sparkles: any; export const Filter: any; export const SearchIcon: any;
  export const CheckCircle2: any; export const Clock: any; export const Sun: any; export const BriefcaseBusiness: any; export const Target: any; export const Workflow: any;
  export const BarChart3: any; export const CalendarCheck: any; export const FolderOpen: any; export const Search: any; export const Zap: any;
}

declare const process: any;
declare const Buffer: any;
declare namespace NodeJS { type Timeout = any; }
