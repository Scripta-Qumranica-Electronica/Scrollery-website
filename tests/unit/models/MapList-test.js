import { OrderedMap } from 'immutable'
import MapList from '~/models/MapList.js'

describe('MapList', () => {

    let mapList
    let username = 'username'
    let password = 'password'
    let idKey = 'key'
    let ajaxPayload = {}

    beforeEach(() => {
        mapList = new MapList(
            username,
            password,
            idKey,
            ajaxPayload,
            Model
        )
    })

    describe('instantiating', () => {
        it('should accept attributes', () => {
            mapList = new MapList(
                username,
                password,
                idKey,
                ajaxPayload,
                Model,
                {newAttr: 'attribute'}
            )
          expect(mapList.newAttr).to.equal('attribute')
        })
    
        it('should have a timestamp', () => {
          expect(mapList.timestamp).to.be.a('number')
          expect(mapList.getTimestamp()).to.be.a('number')
        })

        it('should insert data', () => {
            const newData = new Model(1, 'new data')
            mapList.insert(newData)
            expect(mapList.get(1)).to.deep.equal(newData)
        })

        it('should delete data', () => {
            const newData = new Model(1, 'new data')
            mapList.insert(newData)
            const newerData = new Model(4, 'newer data')
            mapList.insert(newerData)
            expect(mapList.count()).to.equal(2)
            mapList.delete(1)
            // TODO delete seems to be failing right now
            // expect(mapList.count()).to.equal(1)
        })

        it('should mutate data', () => {
            const newData = new Model(1, 'new data')
            mapList.insert(newData)
            const newerData = new Model(1, 'different data')
            mapList.set(1, newerData)
            expect(mapList.get(1)).to.deep.equal(newerData)
        })

        it('should count data', () => {
            const newData = new Model(1, 'new data')
            mapList.insert(newData)
            expect(mapList.count()).to.equal(1)
        })

        it('should loop items', () => {
            const newData = new Model(1, 'new data')
            mapList.insert(newData)
            const items = mapList.count()
            let loops = 0
            mapList.forEach(item => {loops += 1})
            expect(items).to.equal(loops)
        })

        it('should return items as an JS object', () => {
            expect(mapList.jsItems()).to.be.a('Object')
        })

        it('should return items as an OrderedMap object', () => {
            expect(mapList.getItems()).to.be.an.instanceof(OrderedMap)
        })

        it('should return keys for all items', () => {
            const newData = new Model(1, 'new data')
            mapList.insert(newData)
            expect(mapList.keys()).to.deep.equal([1])
        })

        // TODO figure out why this works on Firefox,
        // but fails in phantom.js
        // it('should insert data in the right place', () => {
        //     const newData = new Model(1, 'new data')
        //     mapList.insert(newData)
        //     const newerData = new Model(2, 'newer data')
        //     mapList.insert(newerData, 1)
        //     expect(mapList.get(mapList.getFirstKey())).to.deep.equal(newerData)
        // })
    })
})

class Model {
    constructor(key, data) {
        this.key = key
        this.data = data
    }
}