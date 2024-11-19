export class ApiFeature{
    constructor(mongooseQuery, queryData) {
        this.mongooseQuery = mongooseQuery
        this.queryData = queryData
    }

    pagination() {
        let { size, page } = this.queryData

        if (!size || size <= 0)
            size = 3

        if (!page || page <= 0)
            page = 1
        const skip = size * (page - 1)

        this.mongooseQuery.limit(size).skip(skip)

        return this
    }

    sort() {
        let { sort } = this.queryData

        sort = sort?.replaceAll(',', ' ')

        this.mongooseQuery.sort(sort)

        return this

    }

    select() {
        let { select } = this.queryData

        select = select?.replaceAll(',', ' ')

        this.mongooseQuery.select(select)

        return this
    }

    filter() {
        let { size, page, sort, select, ...filter } = this.queryData

        filter = JSON.parse(JSON.stringify(filter)
            .replace(/'gte|gt|lt|lte'/g, match => `$${match}`))

        this.mongooseQuery.find(filter)

        return this
    }
}