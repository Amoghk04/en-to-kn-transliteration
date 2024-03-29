interface ISchema<T> {
    vowels: T,
    marks: T,
    virama: string,
    other: T,
    consonants: T,
    symbols: T,
}

class Schema<T> implements ISchema<T> {
    readonly vowels;
    readonly marks;
    readonly virama;
    readonly other;
    readonly consonants;
    readonly symbols;

    // if new data members are added here, modify the SchemaMap constructor

    constructor(schemaProps: ISchema<T>) {
        this.vowels = schemaProps.vowels;
        this.marks = schemaProps.marks;
        this.virama = schemaProps.virama;
        this.other = schemaProps.other;
        this.consonants = schemaProps.consonants;
        this.symbols = schemaProps.symbols;
    }
}

type OneToMany = { [key: string]: string[]; };
// type FromSchema = Schema<string[]>;
// type ToSchema = Schema<string[][]>;

class SchemaMap {
    readonly vowels: OneToMany;
    readonly marks: OneToMany;
    readonly virama: string[];
    readonly consonants: OneToMany;
    readonly other: OneToMany;
    readonly longest: number;

    private zipArrays(fromArr: string[], toArr: string[][]) {
        return Object.fromEntries(
            fromArr.map(
                (k, i) => [k, toArr[i]]
            )
        );
    }

    constructor(
        fromSchema: Schema<string[]>,
        toSchema: Schema<string[][]>
    ) {
        this.marks = this.zipArrays(fromSchema.marks, toSchema.marks);
        this.virama = [toSchema.virama];

        this.vowels = this.zipArrays(fromSchema.vowels, toSchema.vowels);
        this.consonants = this.zipArrays(fromSchema.consonants, toSchema.consonants);

        this.other = {
            ...this.zipArrays(fromSchema.other, toSchema.other),
            ...this.vowels,
            ...this.consonants,
        };

        const flattenedEnglishStrings = [
            ...fromSchema.vowels,
            ...fromSchema.marks,
            fromSchema.virama, // 0-length string
            ...fromSchema.other,
            ...fromSchema.consonants,
            ...fromSchema.symbols,
            // new data members go here
        ];

        this.longest = Math.max(
            ...flattenedEnglishStrings.map(v => v.length)
        );
    }
}

// or use module.export = {}
export {
    Schema,
    SchemaMap
}