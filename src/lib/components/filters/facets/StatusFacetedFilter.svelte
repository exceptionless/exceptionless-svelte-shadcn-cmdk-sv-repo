<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Writable } from 'svelte/store';

    import { StatusFilter } from '$comp/filters/filters';
    import MultiselectFacetedFilter from './base/MultiselectFacetedFilter.svelte';

const stackStatuses: { value: string; label: string }[] = [
    {
        value: 'Open',
        label: 'Open'
    },
    {
        value: 'Fixed',
        label: 'Fixed'
    },
    {
        value: 'Regressed',
        label: 'Regressed'
    },
    {
        value: 'Snoozed',
        label: 'Snoozed'
    },
    {
        value: 'Ignored',
        label: 'Ignored'
    },
    {
        value: 'Discarded',
        label: 'Discarded'
    }
];


    const dispatch = createEventDispatcher();
    export let filter: StatusFilter;
    export let title: string = 'Status';
    export let open: Writable<boolean>;

    function onChanged() {
        dispatch('changed', filter);
    }

    function onRemove() {
        dispatch('remove', filter);
    }
</script>

<MultiselectFacetedFilter {open} {title} bind:values={filter.value} options={stackStatuses} on:changed={onChanged} on:remove={onRemove}
></MultiselectFacetedFilter>
