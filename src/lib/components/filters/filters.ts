import { get, type Writable } from 'svelte/store';

export interface IFilter {
    readonly type: string;
    readonly key: string;
    isEmpty(): boolean;
    reset(): void;
    toFilter(): string;
}

export class BooleanFilter implements IFilter {
    constructor(
        public term?: string,
        public value?: boolean
    ) {}

    public type: string = 'boolean';

    public get key(): string {
        return `${this.type}:${this.term}`;
    }

    public isEmpty(): boolean {
        return this.value === undefined;
    }

    public reset(): void {
        this.value = undefined;
    }

    public toFilter(): string {
        if (this.term === undefined) {
            return '';
        }

        if (this.value === undefined) {
            return `_missing_:${this.term}`;
        }

        return `${this.term}:${this.value}`;
    }
}

export class DateFilter implements IFilter {
    constructor(
        public term?: string,
        public value?: Date | string
    ) {}

    public type: string = 'date';

    public get key(): string {
        return `${this.type}:${this.term}`;
    }

    public isEmpty(): boolean {
        return this.value === undefined;
    }

    public reset(): void {
        this.value = undefined;
    }

    public toFilter(): string {
        if (this.term === undefined) {
            return '';
        }

        if (this.value === undefined) {
            return `_missing_:${this.term}`;
        }

        const date = this.value instanceof Date ? this.value.toISOString() : this.value;
        return `${this.term}:${quoteIfSpecialCharacters(date)}`;
    }
}

export class KeywordFilter implements IFilter {
    constructor(public value?: string) {}

    public type: string = 'keyword';

    public get key(): string {
        return this.type;
    }

    public isEmpty(): boolean {
        return !this.value?.trim();
    }

    public reset(): void {
        this.value = undefined;
    }

    public toFilter(): string {
        if (this.isEmpty()) {
            return '';
        }

        return this.value!.trim();
    }
}

export class StatusFilter implements IFilter {
    constructor(public value: string[]) {}

    public type: string = 'status';

    public get key(): string {
        return this.type;
    }

    public isEmpty(): boolean {
        return this.value.length === 0;
    }

    public reset(): void {
        this.value = [];
    }

    public toFilter(): string {
        if (this.value.length == 0) {
            return '';
        }

        if (this.value.length == 1) {
            return `status:${this.value[0]}`;
        }

        return `(${this.value.map((val) => `status:${val}`).join(' OR ')})`;
    }
}

export class StringFilter implements IFilter {
    constructor(
        public term?: string,
        public value?: string
    ) {}

    public type: string = 'string';

    public get key(): string {
        return `${this.type}:${this.term}`;
    }

    public isEmpty(): boolean {
        return this.value === undefined;
    }

    public reset(): void {
        this.value = undefined;
    }

    public toFilter(): string {
        if (this.term === undefined) {
            return '';
        }

        if (this.value === undefined) {
            return `_missing_:${this.term}`;
        }

        return `${this.term}:${quoteIfSpecialCharacters(this.value)}`;
    }
}

export function quoteIfSpecialCharacters(value?: string | null): string | null | undefined {
    // Check for lucene special characters or whitespace
    const regex = new RegExp('\\+|\\-|\\&|\\||\\!|\\(|\\)|\\{|\\}|\\[|\\]|\\^|\\"|\\~|\\*|\\?|\\:|\\\\|\\/|\\s', 'g');

    if (value && value.match(regex)) {
        return quote(value);
    }

    return value;
}

export function quote(value?: string | null): string | undefined {
    return value ? `"${value}"` : undefined;
}

export function toFilter(filters: IFilter[]): string {
    return filters
        .map((f) => f.toFilter())
        .filter(Boolean)
        .join(' ')
        .trim();
}

export function getFilter(filter: Omit<IFilter, 'isEmpty' | 'reset' | 'toFilter'> & Record<string, unknown>): IFilter | undefined {
    switch (filter.type) {
        case 'boolean':
            return new BooleanFilter(filter.term as string, filter.value as boolean);
        case 'date':
            return new DateFilter(filter.term as string, filter.value as Date);
        case 'keyword':
        case 'status':
            return new StatusFilter(filter.value as string[]);
        case 'string':
            return new StringFilter(filter.term as string, filter.value as string);
        default:
            throw new Error(`Unknown filter type: ${filter.type}`);
    }
}

export function setFilter(filters: IFilter[], filter: IFilter): IFilter[] {
    const existingFilter = filters.find((f) => f.key === filter.key && ('term' in f && 'term' in filter ? f.term === filter.term : true));
    if (existingFilter) {
        if ('value' in existingFilter && 'value' in filter) {
            if (Array.isArray(existingFilter.value) && Array.isArray(filter.value)) {
                existingFilter.value = [...new Set([...existingFilter.value, ...filter.value])];
            } else {
                existingFilter.value = filter.value;
            }
        } else {
            Object.assign(existingFilter, filter);
        }
    } else {
        filters.push(filter);
    }

    return filters;
}

export function getDefaultFilters(includeDateFilter = true): IFilter[] {
    return [
        new StatusFilter([]),
        new DateFilter('date', 'last week'),
        new KeywordFilter()
    ].filter((f) => includeDateFilter || f.type !== 'date');
}

export function filterChanged(filters: Writable<IFilter[]>, updated: IFilter): void {
    filters.set(processFilterRules(setFilter(get(filters), updated), updated));
}

export function filterRemoved(filters: Writable<IFilter[]>, defaultFilters: IFilter[], removed?: IFilter): void {
    // If detail is undefined, remove all filters.
    if (!removed) {
        filters.set(defaultFilters);
    } else if (defaultFilters.find((f) => f.key === removed.key)) {
        filters.set(processFilterRules(setFilter(get(filters), removed), removed));
    } else {
        filters.set(
            processFilterRules(
                get(filters).filter((f) => f.key !== removed.key),
                removed
            )
        );
    }
}

export function processFilterRules(filters: IFilter[], changed?: IFilter): IFilter[] {
    // Allow only one filter per type and term.
    const groupedFilters: Partial<Record<string, IFilter[]>> = Object.groupBy(filters, (f: IFilter) => f.key);
    const filtered: IFilter[] = [];
    Object.entries(groupedFilters).forEach(([, items]) => {
        if (items && items.length > 0) {
            filtered.push(items[0]);
        }
    });

    return filtered;
}
