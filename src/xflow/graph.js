(function(){

/**
 * The Xflow graph includes the whole dataflow graph
 * @constructor
 */
var Graph = function(){
    this._nodes = [];
};
Xflow.Graph = Graph;

/**
 * Type of Modification, used internally only
 * @private
 * @enum
 */
XflowModification = {
    NONE: 0,
    DATA_CHANGED: 1,
    STRUCTURE_CHANGED: 2
};

/**
 * @return {Xflow.InputNode}
 */
Graph.prototype.createInputNode = function(){
    var node = new Xflow.InputNode(this);
    this._nodes.push(node);
    return node;
};

/**
 * @return {Xflow.DataNode}
 */
Graph.prototype.createDataNode = function(){
    var node = new Xflow.DataNode(this);
    this._nodes.push(node);
    return node;
};

/**
 * @constructor
 * @param {Xflow.Graph} graph
 */
var GraphNode = function(graph){
    this._graph = graph;
    this._parents = [];
};
Xflow.GraphNode = GraphNode;

/**
 * @constructore
 * @param {Xflow.Graph} graph
 * @extends {Xflow.GraphNode}
 */
var InputNode = function(graph){
    Xflow.GraphNode.call(this, graph);
    this._name = "";
    this._seqnr = 0;
    this._data = null;
    this._param = false;
};
XML3D.createClass(InputNode, Xflow.GraphNode);
Xflow.InputNode = InputNode;

Object.defineProperty(InputNode.prototype, "name", {
    /** @param {string} v */
    set: function(v){
        this._name = v;
        notifyParentsOnChanged(this, XflowModification.STRUCTURE_CHANGED);
    },
    /** @return {string} */
    get: function(){ return this._name; }
});
Object.defineProperty(InputNode.prototype, "seqnr", {
    /** @param {number} v */
    set: function(v){
        this._seqnr = v;
        notifyParentsOnChanged(this, XflowModification.STRUCTURE_CHANGED);
    },
    /** @return {number} */
    get: function(){ return this._seqnr; }
});
Object.defineProperty(InputNode.prototype, "param", {
    /** @param {boolean} v */
    set: function(v){
        this._param = v;
        notifyParentsOnChanged(this, XflowModification.STRUCTURE_CHANGED);
    },
    /** @return {boolean} */
    get: function(){ return this._param; }
});
Object.defineProperty(InputNode.prototype, "data", {
    /** @param {Object} v */
    set: function(v){
        if(this._data) this._data.removeListener(this);
        this._data = v;
        if(this._data) this._data.addListener(this);
        notifyParentsOnChanged(this, XflowModification.DATA_CHANGED, this._name);
    },
    /** @return {Object} */
    get: function(){ return this._data; }
});



/**
 * @constructore
 * @extends {Xflow.GraphNode}
 */
var DataNode = function(graph){
    Xflow.GraphNode.call(this, graph);
    this._prototype = false;
    this._children = [];
    this._sourceNode = null;
    this._protoNode = null;

    this._filterType = 0;
    this._filterMapping = new Xflow.OrderMapping(this);

    this._computeOperator = "";
    this._computeInputMapping = new Xflow.OrderMapping(this);
    this._computeOutputMapping = new Xflow.OrderMapping(this);

    this._state = XflowModification.NONE;

    this._initCompute();
    this._requests = [];
};
XML3D.createClass(DataNode, Xflow.DataNode);
Xflow.DataNode = DataNode;

/**
 * Filter Type of DataNode
 * KEEP - Keep only the provided names
 * REMOVE - Remove provided names (ignores name mapping)
 * RENAME - Only apply name mapping
 * @enum
 */
DataNode.FILTER_TYPE = {
    KEEP: 0,
    REMOVE: 1,
    RENAME: 2
}
/**
 * @private
 * @param {Xflow.DataNode} parent
 * @param {Xflow.DataNode|Xflow.InputNode} child
 */
function addParent(parent, child){
    child._parents.push(parent);
}

/**
 * @private
 * @param {Xflow.DataNode} parent
 * @param {Xflow.DataNode|Xflow.InputNode} child
 */
function removeParent(parent, child){
    Array.erase(child._parents, parent);
}

Object.defineProperty(DataNode.prototype, "prototype", {
    /** @param {boolean} v */
    set: function(v){ this._prototype = v;
    },
    /** @return {boolean} */
    get: function(){ return this._prototype; }
});
Object.defineProperty(DataNode.prototype, "sourceNode", {
    /** @param {Xflow.DataNode,null} v */
    set: function(v){
        if(this._sourceNode) removeParent(this, this._sourceNode);
        this._sourceNode = v;
        if(this._sourceNode) addParent(this, this._sourceNode);
    },
    /** @return {Xflow.DataNode,null} */
    get: function(){ return this._sourceNode; }
});
Object.defineProperty(DataNode.prototype, "protoNode", {
    /** @param {Xflow.DataNode,null} v */
    set: function(v){
        if(this._protoNode) removeParent(this, this._protoNode);
        this._protoNode = v;
        if(this._protoNode) addParent(this, this._protoNode);
        this.notify(XflowModification.STRUCTURE_CHANGED);
    },
    /** @return {Xflow.DataNode,null} */
    get: function(){ return this._protoNode; }
});

Object.defineProperty(DataNode.prototype, "filterType", {
    /** @param {Xflow.DataNode.FILTER_TYPE} v */
    set: function(v){
        this._filterType = v;
        this.notify( XflowModification.STRUCTURE_CHANGED);
    },
    /** @return {Xflow.DataNode.FILTER_TYPE} */
    get: function(){ return this._filterType; }
});

Object.defineProperty(DataNode.prototype, "filterMapping", {
    /** @param {Xflow.Mapping} v */
    set: function(v){ throw "filterMapping is readonly!";
    },
    /** @return {Xflow.Mapping} */
    get: function(){ return this._filterMapping; }
});

Object.defineProperty(DataNode.prototype, "computeOperator", {
    /** @param {string} v */
    set: function(v){
        this._computeOperator = v;
        this.notify( XflowModification.STRUCTURE_CHANGED);
    },
    /** @return {string} */
    get: function(){ return this._computeOperator; }
});
Object.defineProperty(DataNode.prototype, "computeInputMapping", {
    /** @param {Xflow.Mapping} v */
    set: function(v){ throw "computeInputMapping is readonly!";
    },
    /** @return {Xflow.Mapping} */
    get: function(){ return this._computeInputMapping; }
});
Object.defineProperty(DataNode.prototype, "computeOutputMapping", {
    /** @param {Xflow.Mapping} v */
    set: function(v){ throw "computeOutputMapping is readonly!";
    },
    /** @return {Xflow.Mapping} */
    get: function(){ return this._computeOutputMapping; }
});

/**
 * @param {Xflow.GraphNode} child
 */
DataNode.prototype.appendChild = function(child){
    this._children.push(child);
    addParent(this, child)
    this.notify( XflowModification.STRUCTURE_CHANGED);
};
/**
 * @param {Xflow.GraphNode} child
 */
DataNode.prototype.removeChild = function(child){
    Array.erase(this._children, child);
    removeParent(this, child)
    this.notify( XflowModification.STRUCTURE_CHANGED);
};
/**
 * @param {Xflow.GraphNode} child
 * @param {Xflow.GraphNode} beforeNode
 */
DataNode.prototype.insertBefore = function(child, beforeNode){
    var idx = this._children.indexOf(beforeNode);
    if(idx == -1)
        this._children.push(child);
    else
        this._children.splice(idx, 0, child);
    addParent(this, child)
    this.notify( XflowModification.STRUCTURE_CHANGED);
};
/**
 * remove all children of the DataNode
 */
DataNode.prototype.clearChildren = function(){
    for(var i =0; i < this._children.length; ++i){
        removeParent(this, this._children[i]);
    }
    this._children = [];
    this.notify( XflowModification.STRUCTURE_CHANGED);
};

/**
 * Detach this DataNode from all connections, including source- and proto-node references
 */
DataNode.prototype.detachFromParents = function(){
    for(var i =0; i < this._parents.length; ++i){
        var parent = this._parents[i];
        if(parent._sourceNode == this)
            parent.sourceNode = null;
        else if(parent._protoNode == this){
            parent.protoNode = null;
        }
        else{
            parent.removeChild(this);
        }
    }
    this._children = [];
};

/**
 * @const
 */
var filterParser = /^([A-Za-z]*)\(([^()]+)\)$/;

/**
 * Set filter by string
 * @param {string} filterString
 */
DataNode.prototype.setFilter = function(filterString){
    filterString = filterString || "";
    var newType = DataNode.FILTER_TYPE.RENAME;
    var newMapping = null;
    var result = filterString.trim().match(filterParser);
    if(result){
        var type = ""+result[1];
        switch(type){
            case "keep": newType = DataNode.FILTER_TYPE.KEEP; break;
            case "remove": newType = DataNode.FILTER_TYPE.REMOVE; break;
            case "rename": newType = DataNode.FILTER_TYPE.RENAME; break;
        }
        newMapping = Xflow.Mapping.parse(result[2], this);
    }
    if(!newMapping){
        newMapping = new Xflow.OrderMapping(this);
    }
    removeMappingOwner(this._filterMapping);
    this._filterMapping = newMapping;
    this._filterType = newType;
    this.notify( XflowModification.STRUCTURE_CHANGED);
};

var computeParser = /^(([^=]+)\=)?([^(]+)\(([^()]*)\)$/;
var bracketsParser = /^\(([^()]*)\)$/;

/**
 * Set compute by string
 * @param {string} computeString
 */
DataNode.prototype.setCompute = function(computeString){
    computeString = computeString || "";
    var newOperator = "";
    var inputMapping = null, outputMapping = null;
    var result = computeString.trim().match(computeParser);
    if(result){
        var output = result[2].trim();
        newOperator = result[3];
        var input = result[4].trim();
        if(result = output.match(bracketsParser)){
            output = result[1];
        }
        inputMapping = Xflow.Mapping.parse(input);
        outputMapping = Xflow.Mapping.parse(output);
    }
    if(!inputMapping) inputMapping = new Xflow.OrderMapping(this);
    if(!outputMapping) outputMapping = new Xflow.OrderMapping(this);
    removeMappingOwner(this._computeInputMapping);
    removeMappingOwner(this._computeOutputMapping);
    this._computeInputMapping = inputMapping;
    this._computeOutputMapping = outputMapping;
    this._computeOperator = newOperator;
    this.notify( XflowModification.STRUCTURE_CHANGED);
}
/**
 * Notifies DataNode about a change. Notification will be forwarded to parents, if necessary
 * @param {XflowModification} changeType
 * @param {string, null} name
 */
DataNode.prototype.notify = function(changeType, name){
    if(changeType == XflowModification.STRUCTURE_CHANGED && this._state != changeType)
    {
        this._state = changeType;
        notifyParentsOnChanged(this, changeType, name);
        this._updateComputeCache(changeType);
        for(var i in this._requests)
            this._requests[i].notify(Xflow.RequestNotification.CHANGED_STRUCTURE);
    }
    else if(changeType == XflowModification.DATA_CHANGED && this._state < changeType){
        this._state = changeType;
        notifyParentsOnChanged(this, changeType, name);
        this._updateComputeCache(changeType);
        for(var i in this._requests)
            this._requests[i].notify(Xflow.RequestNotification.CHANGED_STRUCTURE);
    }
};

/**
 * Notify all parent nodes about a change
 * @param {Xflow.GraphNode} node
 * @param {XflowModification} changeType
 * @param {string, null} name
 * @private
 */
function notifyParentsOnChanged(node, changeType, name){
    for(var i = 0; i < node._parents.length; ++i){
        node._parents[i].notify(changeType, name);
    }
};
/**
 * Remove owner from mapping, small helper function
 * @param {Xflow.Mapping} mapping
 * @private
 */
function removeMappingOwner(mapping){
    if(mapping)
        mapping._owner = null;
};


})();