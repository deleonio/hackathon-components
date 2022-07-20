export declare enum Events {
	onBlur = 'onBlur',
	onChange = 'onChange',
	onClick = 'onClick',
	onDblClick = 'onDblClick',
	onFocus = 'onFocus',
	onInput = 'onInput',
	onKeyDown = 'onKeyDown',
	onKeyPress = 'onKeyPress',
	onKeyUp = 'onKeyUp',
	onMouseDown = 'onMouseDown',
	onMouseMove = 'onMouseMove',
	onMouseOut = 'onMouseOut',
	onMouseOver = 'onMouseOver',
	onMouseUp = 'onMouseUp',
	onSelect = 'onSelect',
	onSubmit = 'onSubmit',
}

export declare type Callback<T> = (event: T) => void;
export declare type EventCallback<E extends Event> = Callback<E>;
export declare type EventValueCallback<E extends Event, V> = (event: E, value: V) => void;

export declare type KoliBriPaginationButtonCallbacks = {
	[Events.onClick]?: EventValueCallback<Event, number>;
};

export declare type PaginationRequiredProps = {
	count: number;
	on?: KoliBriPaginationButtonCallbacks;
	page: number;
};

export declare type PaginationOptionalProps = {
	boundaryCount?: number;
	siblingCount?: number;
};

export type KoliBriTableRender = <T>(domNode: HTMLElement, cell: KoliBriTableCell, tupel: T, data: T[]) => string | void;
export type KoliBriTableSort = <T>(data: T[]) => T[];
export type KoliBriTableDataSet<T> = T[];
export type KoliBriTableCellTextAlign = 'center' | 'left' | 'right' | 'justify';
export type KoliBriTablePaginationRowsPerPage = 10 | 25 | 50 | 100;
export type KoliBriDataType = Record<string, unknown>;
export type KoliBriSortFunction = (data: KoliBriDataType[]) => KoliBriDataType[];
export type KoliBriSortDirection = 'ASC' | 'DESC' | 'NOS';
export type KoliBriTablePaginationProps = {
	page: number;
} & PaginationRequiredProps &
	PaginationOptionalProps;
export type KoliBriTablePaginationStates = {
	count: number;
	page: number;
} & PaginationRequiredProps &
	PaginationOptionalProps;
export type KoliBriTableCell = {
	asTd?: boolean;
	colSpan?: number;
	label: string;
	render?: KoliBriTableRender;
	rowSpan?: number;
	sort?: KoliBriTableSort;
	textAlign?: KoliBriTableCellTextAlign;
	width?: string;
};
export type KoliBriTableHeaderCell = KoliBriTableCell & {
	asTd?: boolean;
	key?: string;
	sort?: KoliBriTableSort;
	sortDirection?: KoliBriSortDirection;
	textAlign?: KoliBriTableCellTextAlign;
};
export type KoliBriTableHeaders = {
	horizontal?: KoliBriTableHeaderCell[][];
	vertical?: KoliBriTableHeaderCell[][];
};

export type KoliBriTableHeaderCellAndData = KoliBriTableHeaderCell & {
	data: KoliBriDataType;
};

export type Stringified<T> = T | string;
