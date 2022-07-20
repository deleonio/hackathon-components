import { KolButton } from '@kolibri/react';
import React from 'react';
import { getRoot } from './react-roots';
import { KoliBriTableHeaders } from './types';

type TableValue = {
	montag: string;
	dienstag: string;
	mittwoch: string;
	donnerstag: string;
	freitag: string;
	samstag: string;
	sonntag: string;
};

export const TABLE_HEADERS2: KoliBriTableHeaders = {
	horizontal: [
		[
			{
				label: 'Werktage',
				colSpan: 5,
			},
			{
				label: 'Wochenende',
				colSpan: 2,
			},
		],
		[
			{
				label: 'Montag',
				key: 'montag',
			},
			{
				label: 'Dienstag',
				key: 'dienstag',
			},
			{
				label: 'Mittwoch',
				key: 'mittwoch',
			},
			{
				label: 'Donnerstag',
				key: 'donnerstag',
			},
			{
				label: 'Freitag',
				key: 'freitag',
			},
			{
				label: 'Samstag',
				key: 'samstag',
			},
			{
				label: 'Sonntag',
				key: 'sonntag',
			},
		],
	],
};

export const TABLE_HEADERS: KoliBriTableHeaders = {
	horizontal: [
		[
			{
				label: '',
				rowSpan: 2,
				asTd: true,
			},
			{
				label: 'Werktage',
				colSpan: 5,
			},
			{
				label: 'Wochenende',
				colSpan: 2,
			},
		],
		[
			{
				key: 'mon∏g',
				label: 'Montag',
				sortDirection: 'ASC',
				textAlign: 'center',
				render: (el, _cell, tupel: TableValue) => {
					getRoot(el).render(<KolButton _label={tupel.montag}></KolButton>);
				},
			},
			{
				key: 'dienstag',
				label: 'Dienstag',
				sortDirection: 'DESC',
			},
			{
				key: 'mittwoch',
				label: 'Mittwoch',
			},
			{
				key: 'donnerstag',
				label: 'Donnerstag',
			},
			{
				key: 'freitag',
				label: 'Freitag',
			},
			{
				key: 'samstag',
				label: 'Samstag',
			},
			{
				key: 'sonntag',
				label: 'Sonntag',
			},
		],
	],
	vertical: [
		[
			{
				label: 'Früh',
			},
			{
				label: 'Mittag',
			},
			{
				label: 'Abend',
			},
			{
				label: 'Nacht',
			},
		],
	],
};

export let TABLE_DATA: TableValue[] = [
	{
		montag: 'Alex',
		dienstag: 'Hong',
		mittwoch: 'Kevin',
		donnerstag: 'Fabian',
		freitag: 'Alex',
		samstag: 'Kevin',
		sonntag: 'Hong',
	},
	{
		montag: 'Helena',
		dienstag: 'Fabian',
		mittwoch: 'Marie',
		donnerstag: 'Ben',
		freitag: 'Marcus',
		samstag: 'Alex',
		sonntag: 'Marcus',
	},
	{
		montag: 'Fabian',
		dienstag: 'Helena',
		mittwoch: 'Fabian',
		donnerstag: 'Maya',
		freitag: 'Ben',
		samstag: 'Alex',
		sonntag: 'Helena',
	},
	{
		montag: 'Hong',
		dienstag: 'Alex',
		mittwoch: 'Kevin',
		donnerstag: 'Maya',
		freitag: 'Fabian',
		samstag: 'Helena',
		sonntag: 'Alex',
	},
];

for (let i = 0; i < 10; i++) {
	TABLE_DATA = TABLE_DATA.concat(TABLE_DATA);
}
