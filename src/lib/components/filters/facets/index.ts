import type { FacetedFilter } from '$comp/faceted-filter';
import { writable } from 'svelte/store';
import { type BooleanFilter, type DateFilter, type IFilter, type StringFilter } from '../filters';

import BooleanFacetedFilter from './BooleanFacetedFilter.svelte';
import DateFacetedFilter from './DateFacetedFilter.svelte';
import KeywordFacetedFilter from './KeywordFacetedFilter.svelte';
import StatusFacetedFilter from './StatusFacetedFilter.svelte';
import StringFacetedFilter from './StringFacetedFilter.svelte';

export function toFacetedFilters(filters: IFilter[]): FacetedFilter[] {
    return filters.map((filter) => {
        switch (filter.type) {
            case 'boolean': {
                const booleanFilter = filter as BooleanFilter;
                return { title: (booleanFilter.term as string) ?? 'Boolean', component: BooleanFacetedFilter, filter, open: writable(false) };
            }
            case 'date': {
                const dateFilter = filter as DateFilter;
                const title = dateFilter.term === 'date' ? 'Date Range' : dateFilter.term ?? 'Date';
                return { title, component: DateFacetedFilter, filter, open: writable(false) };
            }
            case 'keyword': {
                return { title: 'Keyword', component: KeywordFacetedFilter, filter, open: writable(false) };
            }
            case 'status': {
                return { title: 'Status', component: StatusFacetedFilter, filter, open: writable(false) };
            }
            case 'string': {
                const stringFilter = filter as StringFilter;
                return { title: (stringFilter.term as string) ?? 'String', component: StringFacetedFilter, filter, open: writable(false) };
            }
            default: {
                throw new Error(`Unknown filter type: ${filter.type}`);
            }
        }
    });
}
