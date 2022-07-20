import { KolButton, KolPagination, KolSelect } from '@kolibri/react';
import React, { Component } from 'react';
import './style.css';
import {
	KoliBriDataType,
	KoliBriSortDirection,
	KoliBriSortFunction,
	KoliBriTableCell,
	KoliBriTableHeaderCell,
	KoliBriTableHeaderCellAndData,
	KoliBriTableHeaders,
	KoliBriTablePaginationProps,
} from './types';

type Props = {
	caption: string;
	data: KoliBriDataType[];
	headers: KoliBriTableHeaders;
	pagination?: boolean | KoliBriTablePaginationProps;
	minWidth?: string;
	sortDirection?: KoliBriSortDirection;
};

type State = {
	caption: string;
	data: KoliBriDataType[];
	headers: KoliBriTableHeaders;
	pagination: KoliBriTablePaginationProps;
	sortedData: KoliBriDataType[];
	minWidth?: string;
	sortDirection?: KoliBriSortDirection;
};

const PAGINATION_OPTIONS = [
	{
		value: '10',
		label: '10 pro Seite',
	},
	{
		value: '20',
		label: '20 pro Seite',
	},
	{
		value: '50',
		label: '50 pro Seite',
	},
	{
		value: '100',
		label: '100 pro Seite',
	},
];

export class KolReactTable extends Component<Props, State> {
	// https://github.com/ionic-team/stencil/issues/2895
	private horizontal = true;
	private sortFunction?: KoliBriSortFunction;
	private sortDirections: Map<KoliBriSortFunction, KoliBriSortDirection> = new Map();
	private showPagination = false;
	private pageSize = 10;
	private pageStartSlice = 0;
	private pageEndSlice = 10;

	public state: State = {
		caption: '',
		data: [],
		headers: {
			horizontal: [],
			vertical: [],
		},
		pagination: {
			count: 0,
			page: 1,
		},
		sortedData: [],
	};

	public componentDidMount(): void {
		this.patchProps2State();
	}

	private patchProps2State = (): void => {
		this.setState(
			() => {
				return {
					...this.props,
					pagination: this.beforePatchPagination(this.props.data, this.props.pagination),
				};
			},
			() => {
				this.updateSortedData();
			}
		);
	};

	private readonly handlePageChange = {
		onClick: (event: Event, page: number) => {
			if (typeof this.state.pagination.on?.onClick === 'function') {
				this.state.pagination.on.onClick(event, page);
			}
			this.setState((prefState) => {
				return {
					pagination: {
						...prefState.pagination,
						page,
					},
				};
			});
		},
	};

	private readonly onChangePaginationSize = (_event: Event, value: unknown) => {
		value = parseInt((value as string[])[0]);
		if (typeof value === 'number' && value > 0 && this.pageSize !== value) {
			this.pageSize = value;
			this.setState((prefState) => {
				return {
					pagination: {
						...this.beforePatchPagination(prefState.data, prefState.pagination),
						page: 1,
					},
				};
			});
		}
	};

	private readonly beforePatchPagination = (data: KoliBriDataType[], pagination?: boolean | KoliBriTablePaginationProps): KoliBriTablePaginationProps => {
		this.showPagination = pagination === true || (typeof pagination === 'object' && pagination !== null);
		let count = 0;
		if (typeof pagination === 'object' && pagination !== null && typeof pagination.count === 'number' && pagination.count > 0) {
			count = Math.ceil(pagination.count);
		} else {
			count = Math.ceil(data.length / Math.max(this.pageSize, 1));
		}
		const currentPage = typeof pagination === 'object' && pagination !== null && typeof pagination.page === 'number' ? Math.ceil(pagination.page) : 1;
		return {
			...this.state.pagination,
			count: count,
			page: Math.max(1, Math.min(currentPage, count)),
		};
	};

	private getNumberOfCols(horizontalHeaders: KoliBriTableHeaderCell[][], data: KoliBriDataType[]): number {
		let max = 0;
		horizontalHeaders.forEach((row) => {
			let count = 0;
			row.forEach((col) => (count += col.colSpan ?? 1));
			if (max < count) {
				max = count;
			}
		});
		if (max === 0) {
			max = data.length;
		}
		return max;
	}

	private getNumberOfRows(verticalHeaders: KoliBriTableHeaderCell[][], data: KoliBriDataType[]): number {
		let max = 0;
		verticalHeaders.forEach((col) => {
			let count = 0;
			col.forEach((row) => (count += row.rowSpan ?? 1));
			if (max < count) {
				max = count;
			}
		});
		if (max === 0) {
			max = data.length;
		}
		return max;
	}

	// TODO: hier muss noch die order beachtet werden bei colspan und rowspan
	private filterHeaderKeys(headers: KoliBriTableHeaderCell[][]): KoliBriTableHeaderCell[] {
		const primaryHeader: KoliBriTableHeaderCell[] = [];
		headers.forEach((cells) => {
			cells.forEach((cell) => {
				if (typeof cell.key === 'string') {
					primaryHeader.push(cell);
				}
			});
		});
		return primaryHeader;
	}

	private getPrimaryHeader(headers: KoliBriTableHeaders): KoliBriTableHeaderCell[] {
		let primaryHeader: KoliBriTableHeaderCell[] = this.filterHeaderKeys(headers.horizontal ?? []);
		this.horizontal = true;
		if (primaryHeader.length === 0) {
			primaryHeader = this.filterHeaderKeys(headers.vertical ?? []);
			if (primaryHeader.length > 0) {
				this.horizontal = false;
			}
		}
		return primaryHeader;
	}

	private createDataField(data: KoliBriDataType[], headers: KoliBriTableHeaders): KoliBriTableCell[][] {
		headers.horizontal = Array.isArray(headers?.horizontal) ? headers.horizontal : [];
		headers.vertical = Array.isArray(headers?.vertical) ? headers.vertical : [];
		const primaryHeader = this.getPrimaryHeader(headers);
		const maxCols = this.getNumberOfCols(headers.horizontal, data);
		const maxRows = this.getNumberOfRows(headers.vertical, data);
		const dataField: KoliBriTableCell[][] = [];

		const rowCount: number[] = [];
		const rowSpans: number[][] = [];
		headers.vertical.forEach((_row, index) => {
			rowCount[index] = 0;
			rowSpans[index] = [];
		});

		for (let i = 0; i < maxRows; i++) {
			const dataRow: KoliBriTableHeaderCellAndData[] = [];
			headers.vertical.forEach((cells, index) => {
				let sum = 0;
				rowSpans[index].forEach((value) => (sum += value));
				if (sum <= i) {
					const rows = cells[i - sum + rowCount[index]];
					if (typeof rows === 'object') {
						dataRow.push({
							...rows,
							asTd: false,
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
							data: {} as KoliBriDataType,
						});
						let rowSpan = 1;
						if (typeof rows.rowSpan === 'number' && rows.rowSpan > 1) {
							rowSpan = rows.rowSpan;
						}
						rowSpans[index].push(rowSpan);
						if (typeof rows.colSpan === 'number' && rows.colSpan > 1) {
							for (let k = 1; k < rows.colSpan; k++) {
								rowSpans[index + k].push(rowSpan);
							}
						}
						rowCount[index]++;
					}
				}
			});
			for (let j = 0; j < maxCols; j++) {
				if (this.horizontal === true) {
					if (
						typeof primaryHeader[j] === 'object' &&
						primaryHeader[j] !== null &&
						typeof primaryHeader[j].key === 'string' &&
						typeof data[i] === 'object' &&
						data[i] !== null
					) {
						dataRow.push({
							...primaryHeader[j],
							colSpan: undefined,
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
							data: data[i],
							// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
							label: data[i][primaryHeader[j].key as unknown as string] as string,
							rowSpan: undefined,
						});
					}
				} else {
					if (
						typeof primaryHeader[i] === 'object' &&
						primaryHeader[i] !== null &&
						typeof primaryHeader[i].key === 'string' &&
						typeof data[j] === 'object' &&
						data[j] !== null
					) {
						dataRow.push({
							...primaryHeader[i],
							colSpan: undefined,
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
							data: data[j],
							// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
							label: data[j][primaryHeader[i].key as unknown as number] as string,
							rowSpan: undefined,
						});
					}
				}
			}
			dataField.push(dataRow);
		}
		return dataField;
	}

	private selectDisplayedData(data: KoliBriDataType[], pagination: number | undefined, page: number): KoliBriDataType[] {
		if (typeof pagination === 'number' && pagination > 0) {
			this.pageStartSlice = pagination * (page - 1);
			this.pageEndSlice = pagination * page > data.length ? data.length : pagination * page;
			return data.slice(this.pageStartSlice, this.pageEndSlice);
		} else {
			this.pageStartSlice = 0;
			this.pageEndSlice = data.length;
			return data;
		}
	}

	private cellRender(col: KoliBriTableHeaderCellAndData, el?: HTMLElement | null): void {
		const timeout = setTimeout(() => {
			clearTimeout(timeout);
			if (typeof col.render === 'function' && el instanceof HTMLElement) {
				const html = col.render(
					el,
					{
						asTd: col.asTd,
						label: col.label,
						textAlign: col.textAlign,
						width: col.width,
					} as KoliBriTableHeaderCell,
					col.data,
					this.state.data
				);
				if (typeof html === 'string') {
					el.innerHTML = html;
				}
			}
		}, 50);
	}

	private updateSortedData = () => {
		let sortedData: KoliBriDataType[] = this.state.data;
		if (typeof this.sortFunction === 'function') {
			switch (this.sortDirections.get(this.sortFunction)) {
				case 'NOS':
					sortedData = [...this.state.data];
					break;
				case 'ASC':
					sortedData = this.sortFunction([...this.state.data]);
					break;
				default:
					sortedData = this.sortFunction([...this.state.data]).reverse();
			}
		}
		this.setState(() => {
			return {
				sortedData,
			};
		});
	};

	public render(): JSX.Element {
		const displayedData: KoliBriDataType[] = this.selectDisplayedData(
			this.state.sortedData,
			this.showPagination ? this.pageSize : this.state.sortedData.length,
			this.state.pagination.page
		);
		if (this.showPagination === false && Array.isArray(displayedData)) {
			this.pageEndSlice = displayedData.length;
		}
		const dataField = this.createDataField(displayedData, this.state.headers);

		// - https://dequeuniversity.com/rules/axe/3.5/scrollable-region-focusable
		// - https://www.a11yproject.com/posts/how-to-use-the-tabindex-attribute/
		// - https://ux.stackexchange.com/questions/119952/when-is-it-wrong-to-put-tabindex-0-on-non-interactive-content
		// Nicht <div tabindex="0">

		return (
			<div className="kol-react-table-host">
				<div>
					<table
						// role="grid"
						aria-readonly="true"
						style={{
							minWidth: this.state.minWidth,
						}}
					>
						<caption>{this.state.caption}</caption>
						{Array.isArray(this.state.headers.horizontal) && (
							<thead>
								{this.state.headers.horizontal.map((cols, rowIndex) => (
									<tr key={`header-row-${rowIndex}`}>
										{cols.map((col, colIndex) => {
											if (col.asTd === true) {
												return (
													<td
														key={`header-row-${rowIndex}-col-${colIndex}`}
														className={typeof col.textAlign === 'string' && col.textAlign.length > 0 ? col.textAlign : undefined}
														colSpan={col.colSpan}
														rowSpan={col.rowSpan}
														style={{
															textAlign: col.textAlign,
															width: col.width,
														}}
														// role="gridcell"
														ref={
															typeof col.render === 'function'
																? (el) => {
																		this.cellRender(col as KoliBriTableHeaderCellAndData, el);
																  }
																: undefined
														}
													>
														{typeof col.render !== 'function' && col.label}
													</td>
												);
											} else {
												return (
													<th
														key={`header-row-${rowIndex}-col-${colIndex}`}
														// role="columnheader"
														scope={typeof col.colSpan === 'number' && col.colSpan > 1 ? 'colgroup' : 'col'}
														colSpan={col.colSpan}
														rowSpan={col.rowSpan}
														style={{
															width: col.width,
														}}
														aria-sort={
															typeof col.sort === 'function'
																? this.sortDirections.get(col.sort) === 'NOS' || this.sortDirections.get(col.sort) === undefined
																	? 'none'
																	: this.sortDirections.get(col.sort) === 'ASC'
																	? 'ascending'
																	: 'descending'
																: undefined
														}
													>
														<div>
															<div
																className={typeof col.textAlign === 'string' && col.textAlign.length > 0 ? col.textAlign : undefined}
																style={{
																	textAlign: col.textAlign,
																}}
															>
																{col.label}
															</div>
															{typeof col.sort === 'function' && (
																<KolButton
																	exportparts="button,ghost"
																	_ariaLabel={'Sortierung von ' + col.label + ' ändern'}
																	_icon={
																		this.sortDirections.get(col.sort) === 'NOS' || this.sortDirections.get(col.sort) === undefined
																			? 'sort'
																			: this.sortDirections.get(col.sort) === 'ASC'
																			? 'caret-up'
																			: 'caret-down'
																	}
																	_iconOnly
																	_label={'Sortierung von ' + col.label + ' ändern'}
																	_on={{
																		onClick: () => {
																			if (typeof col.sort === 'function') {
																				this.sortFunction = col.sort;
																				switch (this.sortDirections.get(this.sortFunction)) {
																					case 'ASC':
																						this.sortDirections.set(this.sortFunction, 'DESC');
																						break;
																					case 'DESC':
																						this.sortDirections.set(this.sortFunction, 'NOS');
																						break;
																					default:
																						this.sortDirections.set(this.sortFunction, 'ASC');
																				}
																				this.updateSortedData();
																			}
																		},
																	}}
																	_variant="ghost"
																></KolButton>
															)}
														</div>
													</th>
												);
											}
										})}
									</tr>
								))}
							</thead>
						)}
						{/* <tbody aria-atomic="true" aria-live="polite" aria-relevant="additions removals"> */}
						<tbody>
							{dataField.map((row, rowIndex) => {
								return (
									<tr key={`data-row-${rowIndex}`}>
										{row.map((col, colIndex) => {
											if (col.asTd === false) {
												return (
													<th
														key={`data-row-${rowIndex}-col-${colIndex}`}
														// role="rowheader"
														scope={typeof col.rowSpan === 'number' && col.rowSpan > 1 ? 'rowgroup' : 'row'}
														colSpan={col.colSpan}
														rowSpan={col.rowSpan}
														style={{
															width: col.width,
														}}
														aria-sort={
															typeof col.sort === 'function'
																? this.sortDirections.get(col.sort) === 'NOS' || this.sortDirections.get(col.sort) === undefined
																	? 'none'
																	: this.sortDirections.get(col.sort) === 'ASC'
																	? 'ascending'
																	: 'descending'
																: undefined
														}
													>
														<div>
															<div
																className={typeof col.textAlign === 'string' && col.textAlign.length > 0 ? col.textAlign : undefined}
																style={{
																	textAlign: col.textAlign,
																}}
															>
																{col.label}
															</div>
															{typeof col.sort === 'function' && (
																<KolButton
																	exportparts="button,ghost"
																	_ariaLabel={'Sortierung von ' + col.label + ' ändern'}
																	_icon={
																		this.sortDirections.get(col.sort) === 'NOS' || this.sortDirections.get(col.sort) === undefined
																			? 'sort'
																			: this.sortDirections.get(col.sort) === 'ASC'
																			? 'caret-up'
																			: 'caret-down'
																	}
																	_iconOnly
																	_label={'Sortierung von ' + col.label + ' ändern'}
																	_on={{
																		onClick: () => {
																			if (typeof col.sort === 'function') {
																				this.sortFunction = col.sort;
																				switch (this.sortDirections.get(this.sortFunction)) {
																					case 'ASC':
																						this.sortDirections.set(this.sortFunction, 'DESC');
																						break;
																					case 'DESC':
																						this.sortDirections.set(this.sortFunction, 'NOS');
																						break;
																					default:
																						this.sortDirections.set(this.sortFunction, 'ASC');
																				}
																				this.updateSortedData();
																			}
																		},
																	}}
																	_variant="ghost"
																></KolButton>
															)}
														</div>
													</th>
												);
											} else {
												return (
													<td
														key={`data-row-${rowIndex}-col-${colIndex}`}
														// role="gridcell"
														className={typeof col.textAlign === 'string' && col.textAlign.length > 0 ? col.textAlign : undefined}
														colSpan={col.colSpan}
														rowSpan={col.rowSpan}
														style={{
															textAlign: col.textAlign,
															width: col.width,
														}}
														ref={
															typeof col.render === 'function'
																? (el) => {
																		this.cellRender(col as KoliBriTableHeaderCellAndData, el);
																  }
																: undefined
														}
													>
														{typeof col.render !== 'function' && col.label}
													</td>
												);
											}
										})}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
				{this.showPagination && (
					<div className="pagination">
						{Array.isArray(this.state.data) && this.state.data.length > 0 ? (
							<span>
								Einträge {this.pageStartSlice + 1} bis {this.pageEndSlice} von {Array.isArray(this.state.data) ? this.state.data.length : 0} angezeigt
							</span>
						) : (
							<span>Es sind keine Einträge vorhanden.</span>
						)}
						<div>
							<KolPagination
								_boundaryCount={this.state.pagination.boundaryCount}
								_count={this.state.pagination.count}
								_on={this.handlePageChange}
								_page={this.state.pagination.page}
								_siblingCount={this.state.pagination.siblingCount}
								_tooltipAlign="bottom"
							></KolPagination>
							<KolSelect
								_hideLabel
								_id="pagination-size"
								_list={PAGINATION_OPTIONS}
								_on={{
									onChange: this.onChangePaginationSize,
								}}
							>
								Einträge pro Seite
							</KolSelect>
						</div>
					</div>
				)}
			</div>
		);
	}
}
