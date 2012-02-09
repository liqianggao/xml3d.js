var xml3d = xml3d || {};

xml3d.SceneInspector = function(xml3d) {
	var self = this;
	this.xml3d = xml3d;
	if(!this.xml3d)
		return;
	
	this.wrapper = xml3d.parentNode;
		
	this.getOffX = function(node)
	{
		var res = node.offsetLeft;
		while(node = node.offsetParent)
			res += node.offsetLeft;
		return res;
	}
  
	this.getOffY = function(node){
		var res = node.offsetTop;
		while(node = node.offsetParent)
			res += node.offsetTop;
		return res;
	  }
	  
	this.inspect = function(event){
		var button = (event.which || event.button);
		if(button == 2){		
			var x = event.pageX - this.getOffX(this.wrapper);
			var y = event.pageY - this.getOffY(this.wrapper);
			var node = xml3d.getElementByPoint(x, y);
			var path = "";
			while(node && node != xml3d){
				path += " >> " + node + " (ID: " + node.id + ")";
				node = node.parentNode;
			}
			alert("Mouse: " + x + " " + y + " => " + path);	
		}
	}
	  
	this.xml3d.addEventListener("mouseup", 
	function(event){ self.inspect(event) }, false);
};