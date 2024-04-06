<script lang="ts">
    import { derived, writable } from 'svelte/store';

    import * as FacetedFilter from '$comp/faceted-filter';

    import { type IFilter, toFilter, DateFilter, getDefaultFilters, filterChanged, filterRemoved } from '$comp/filters/filters';
    import { toFacetedFilters } from '$comp/filters/facets';

    const defaultFilters = getDefaultFilters();
    const filters = writable<IFilter[]>(defaultFilters);

    const filter = derived(filters, ($filters) => toFilter($filters.filter((f) => f.key !== 'date:date')));
    const facets = derived(filters, ($filters) => toFacetedFilters($filters));
    const time = derived(filters, ($filters) => ($filters.find((f) => f.key === 'date:date') as DateFilter).value as string);

    function onFilterChanged({ detail }: CustomEvent<IFilter>): void {
        if (detail.key !== 'type') {
            filterChanged(filters, detail);
        }
    }

    function onFilterRemoved({ detail }: CustomEvent<IFilter | undefined>): void {
        filterRemoved(filters, defaultFilters, detail);
    }
</script>

<ol class="p-2">
    <li>1. Add status / date range filter (same base component), notice you can't use keyboard navigation on the Command.Items</li>
    <li>2. Add keyword filter, notice you can't use keyboard or tab navigation from input (think form) to other command items for actions.</li>
</ol>

<div class="p-2 flex items-center justify-between gap-x-2">
    <div class="flex flex-1 flex-wrap items-center gap-x-2 gap-y-2">
        <FacetedFilter.Root {facets} on:changed={onFilterChanged} on:remove={onFilterRemoved}></FacetedFilter.Root>
    </div>
</div>