EPSILON = 0.01;

module("Picking Tests", {
    setup : function() {
        stop();
        var that = this;
        this.cb = function(e) {
            ok(true, "Scene loaded");
            that.doc = document.getElementById("xml3dframe").contentDocument;
            that.xml3dEl = that.doc.getElementById("xml3DElem");
            start();
        };
        loadDocument("scenes/picking.xhtml", this.cb);
    },
    teardown : function() {
        var v = document.getElementById("xml3dframe");
        v.removeEventListener("load", this.cb, true);
    }
});

test("xml3d.getElementByPoint(): nothing picked", function() {

    var m = this.xml3dEl.getElementByPoint(260, 211);
    strictEqual(m, null, "Nothing picked here");
});

test("xml3d.getElementByPoint(): simple pick 'm1'", function() {

    var m = this.xml3dEl.getElementByPoint(211, 211);

    ok(m, "Pick is not null");
    equal(m && m.id, "m1");
});

test("xml3d.getElementByPoint(): picked mesh 'm1'", function() {

    var hitP = new XML3DVec3();
    var hitN = new XML3DVec3();

    var m = this.xml3dEl.getElementByPoint(212, 214, hitP, hitN);

    ok(m, "Pick is not null");
    equal(m && m.id, "m1");

    var expectHitP = new XML3DVec3(-0.0015956875868141651, -0.1450980305671692, 2.0039210319519043);
    var expectHitN = new XML3DVec3(1, 0, 0);

    QUnit.closeVector(hitP, expectHitP, EPSILON, "hit point");
    QUnit.closeVector(hitN, expectHitN, EPSILON, "hit normal");
});

test("xml3d.getElementByPoint(): picked mesh 'm2'", function() {

    var hitP = new XML3DVec3();
    var hitN = new XML3DVec3();

    var m = this.xml3dEl.getElementByPoint(305, 211, hitP, hitN);

    ok(m, "Pick is not null");
    equal(m && m.id, "m2");

    var expectHitP = new XML3DVec3(-0.016113698482513428, -0.020995676517486572, -1.8549758195877075);
    var expectHitN = new XML3DVec3(0.7648419737815857, -0.6442176699638367, 0.0006090305396355689);

    QUnit.closeVector(hitP, expectHitP, EPSILON, "hit point");
    QUnit.closeVector(hitN, expectHitN, EPSILON, "hit normal");
});

test("xml3d.generateRay(): point to mesh 'm1'", function() {

    var ray = this.xml3dEl.generateRay(193, 191);

    ok(ray, "ray is not null");

    var expectOrig = new XML3DVec3(10, 0, 0);
    var expectDir = new XML3DVec3(-0.96001172, 0.0755365341, 0.2695769667);

    QUnit.closeVector(ray.origin, expectOrig, EPSILON, "ray's origin");
    QUnit.closeVector(ray.direction, expectDir, EPSILON, "ray's direction");
});

test("xml3d.generateRay(): point to mesh 'm2'", function() {

    var ray = this.xml3dEl.generateRay(324, 221);

    ok(ray, "ray is not null");

    var expectOrig = new XML3DVec3(10, 0, 0);
    var expectDir = new XML3DVec3(-0.9664570689, -0.04404431, -0.2530234456);

    QUnit.closeVector(ray.origin, expectOrig, EPSILON, "ray's origin");
    QUnit.closeVector(ray.direction, expectDir, EPSILON, "ray's direction");
});
