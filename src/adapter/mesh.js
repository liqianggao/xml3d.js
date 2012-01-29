org.xml3d.webgl.MAX_MESH_INDEX_COUNT = 65535;

org.xml3d.webgl.XML3DMeshRenderAdapter = function(factory, node) {
    org.xml3d.webgl.RenderAdapter.call(this, factory, node);
    
    this.processListeners();
    this.dataAdapter = factory.renderer.dataFactory.getAdapter(this.node);
    this.dataAdapter.registerObserver(this);

    this.passChangeToObject = function(evt) { 
        org.xml3d.debug.logError("Mesh adapter has no callback to its mesh object!");
    };
};

org.xml3d.webgl.XML3DMeshRenderAdapter.prototype = new org.xml3d.webgl.RenderAdapter();
org.xml3d.webgl.XML3DMeshRenderAdapter.prototype.constructor = org.xml3d.webgl.XML3DMeshRenderAdapter;

org.xml3d.webgl.XML3DMeshRenderAdapter.prototype.processListeners  = function() {
    var attributes = this.node.attributes;
    for (var index in attributes) {
        var att = attributes[index];
        if (!att.name)
            continue;

        var type = att.name;
        if (type.match(/onmouse/) || type == "onclick") {
            var eventType = type.substring(2);
            this.node.addEventListener(eventType,  new Function("evt", att.value), false);
        }
    }
};

org.xml3d.webgl.XML3DMeshRenderAdapter.prototype.registerCallback = function(callback) {
	if (callback instanceof Function)
		this.passChangeToObject = callback;
};

org.xml3d.webgl.XML3DMeshRenderAdapter.prototype.notifyChanged = function(evt) {
	if (evt.eventType == MutationEvent.REMOVAL) 
		return this.factory.renderer.sceneTreeRemoval(evt);	

    this.passChangeToObject(evt);
};

org.xml3d.webgl.XML3DMeshRenderAdapter.prototype.notifyDataChanged = function(evt) {
     //TODO: fix object form
    this.passChangeToObject(evt);
};

org.xml3d.webgl.XML3DMeshRenderAdapter.prototype.applyXFlow = function(shader, parameters) {
	var dataTable = this.dataAdapter.createDataTable();
	
	if (dataTable["xflowShader"]) {
		var xflowShader = dataTable["xflowShader"];
			
		var declarations = xflowShader.declarations;
		var body = xflowShader.body;
		shader.program = shader.getXFlowShader(declarations, body);
	
		for (var p in xflowShader.uniforms) {
			var data = xflowShader.uniforms[p].data;
			if (data.length < 2)
				data = data[0];
			
			parameters[p] = data;
		}
	}
	
};
