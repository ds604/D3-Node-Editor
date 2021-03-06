var p = (v) => parseInt(v);
var eqArr = (ar1, ar2) => ar1.every((v, i) => v === ar2[i]);
var eqObj = (o1, o2) => JSON.stringify(o1) === JSON.stringify(o2);
var eqCon = (c1, c2, target) => {
    return c1.node === c2.node && c1[target] === c2[target];
}
var diffCons = (cons1, cons2, target) => {
    var removed = cons1.filter(c1 => !cons2.some(c2 => eqCon(c1, c2, target)));
    var added = cons2.filter(c2 => !cons1.some(c1 => eqCon(c1, c2, target)));
    
    return {removed, added}
}

export class Diff {

    constructor(data1, data2) {
        this.a = data1;
        this.b = data2;
    }

    compare() {
        var a = this.a;
        var b = this.b;

        var k1 = Object.keys(a.nodes);
        var k2 = Object.keys(b.nodes);

        var removed = k1.filter(k => !k2.includes(k)).map(p);
        var added = k2.filter(k => !k1.includes(k)).map(p);
        var stayed = k1.filter(k => k2.includes(k)).map(p);

        var moved = stayed.filter(id => {
            var p1 = a.nodes[id].position;
            var p2 = b.nodes[id].position;

            return !eqArr(p1, p2)
        });

        var datachanged = stayed.filter(id => {
            var d1 = a.nodes[id].data;
            var d2 = b.nodes[id].data;

            return !eqObj(d1, d2);
        });

        var connects = stayed.map(id => {
            var i1 = a.nodes[id].inputs;
            var i2 = b.nodes[id].inputs;
            var o1 = a.nodes[id].outputs;
            var o2 = b.nodes[id].outputs;

            var input = i1.map((inp, i) => {
                return diffCons(inp.connections, i2[i].connections, 'output')
            }).filter(diff => diff.added.length !== 0 || diff.removed.length !== 0);

            var output = o1.map((out, i) => {
                return diffCons(out.connections, o2[i].connections, 'input')
            }).filter(diff => diff.added.length !== 0 || diff.removed.length !== 0);

            return { id, input, output };
        }).filter(c => c.input.length !== 0 || c.output.length !== 0);

        return {removed, added, moved, datachanged, connects}
    }
}