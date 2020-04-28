//Pickle tree component created by Kadir Barış Bozat

class PickleTree {
    /**
     * 
     * @param {object} obj as tree object 
     */
    constructor(obj) {
        //target div id
        this.target = obj.c_target;
        //building area
        this.area = '';
        //available nodes list
        this.nodeList = {};
        //row create callback
        this.rowCreateCallback = obj.rowCreateCallback;
        //draw callback
        this.drawCallback = obj.drawCallback;
        //switch callback
        this.switchCallback = obj.switchCallback;
        //drag callback 
        this.dragCallback = obj.dragCallback;
        //drop callback 
        this.dropCallback = obj.dropCallback;
        //tree json data
        this.data = obj.c_data;
        //build tree
        this.build(obj.c_config);

        //start events 
        this.staticEvents();
    }


    //#region Helper Methods

    /**
     * this method will contains static events for tree
     */
    staticEvents() {
        //close menu 
        document.body.addEventListener('click', e => {
            let elm = e.target;
            //close all first 
            document.querySelectorAll('.menuCont').forEach(menu => {
                menu.outerHTML = '';
            });
            if (elm.classList.contains('menuIcon')) {
                //menu toggle event for node
                setTimeout(() => {
                    this.getMenu(e.target, this.getNode(elm.id.split('_')[3]));
                }, 10);
                
            }
        });
        //drag - drop events
        if (this.config.drag) {
            //drag start
            document.getElementById('div_pickletree').addEventListener("dragstart", e => {
                //drag callback
                if (this.dragCallback !== undefined) {
                    this.dragCallback(this.nodeList[parseInt(e.target.id.split('node_')[1])]);
                }
            });

            //draging
            document.getElementById('div_pickletree').addEventListener("drag", e => {
                //get node info for drag
                //show hidden tooltip
                this.div_ddetail.style.display = '';
                //set cordinates as mouse side
                this.div_ddetail.style.top = (e.clientY) + 'px';
                this.div_ddetail.style.left = (e.clientX + 40) + 'px';
                //set title to inside
                this.div_ddetail.innerHTML = '<span>' + e.target.getAttribute('drag-title') + '</span>';

            });
            //drag end
            document.getElementById('div_pickletree').addEventListener("dragend", e => {
                //make tootlip invisable again
                this.div_ddetail.style.display = 'none';
                //clear old targets
                this.clearDebris();
                let node = this.nodeList[parseInt(e.target.id.split('node_')[1])];
                //set old parent for cleaning
                node.old_parent = node.parent;
                if (this.drag_target === parseInt(e.target.id.split('node_')[1])) {
                    //this means it dragged to outside
                    node.parent = { id: 0 };
                } else {
                    let drop = this.getNode(this.drag_target);
                    if (drop === undefined) {
                        node.parent = { id: 0 };
                    } else {
                        node.parent = drop;
                    }
                }
                //set new parent for dragging
                node.updateNode();
                //drop callback
                if (this.dropCallback !== undefined) {
                    this.dropCallback(node);
                }
            });
            //drag location
            document.getElementById('div_pickletree').addEventListener("dragenter", (e) => {
                this.clearDebris();
                if (e.target.classList.contains("drop_target")) {
                    e.target.classList.add('drag_triggered');
                    //this is for updating node parent to current
                    this.drag_target = parseInt(e.target.id.split('node_')[1]);
                }
            });

        }
    }

    /**
     * 
     * @param {string} message for log messages
     */
    log(message) {
        if (this.config.logMode) {
            console.log(message);
        }
    }

    /**
     * Building main details
     */
    build(c_config) {
        //set default config
        this.config = {
            //logs are open or close
            logMode: false,
            //switch mode
            switchMode: false,
            //family mode
            //for child
            autoChild: true,
            //for parent
            autoParent: true,
            //fold icon
            foldedIcon: 'fa fa-plus',
            //unfold icon
            unFoldedIcon: 'fa fa-minus',
            //menu icon
            menuIcon: ['fa', 'fa-list-ul'],
            //start status is collapsed or not
            foldedStatus: false,
            //drag 
            drag: false

        }

        //check config here!!
        for (let key in this.config) {

            if (c_config[key] !== undefined) {
                this.config[key] = c_config[key];
            }
        }

        document.getElementById(this.target).innerHTML = '<div id="div_pickletree"><ul id="tree_picklemain"></ul></div>';
        this.area = document.getElementById('tree_picklemain');
        this.log('tree build started..');
        this.drawData();
    }

    /**
     * 
     * @param {integer} id node id for finding node 
     */
    getNode(id) {
        this.log('node returned..');
        //return node
        return this.nodeList[id];
    }

    /**
     * set child nodes for parent node
     * @param {object} node 
     */
    setChildNodes(node) {
        //update node parent
        for (let key in this.nodeList) {
            if (this.nodeList[key].id === node.parent.id) {
                this.nodeList[key].childs.push(node.id);
                //show icon for childs
                document.getElementById('i_' + this.nodeList[key].id).style.display = '';
            }
        }
    }

    //#endregion

    //#region drag - drop events
    clearDebris() {
        //first clean all entered areas
        let elms = document.querySelectorAll('.drag_triggered');
        for (let i = 0; i < elms.length; i++) {
            elms[i].classList.remove('drag_triggered');
        }
    }


    //#endregion




    //#region Node Events
    /**
     * get child nodes list of node
     * @param {object} node 
     */
    getChilds(node) {
        let list = [];
        for (let key in this.nodeList) {
            if (node.childs.includes(this.nodeList[key].id)) {
                list.push(this.nodeList[key]);
            }
        }
        this.log('node childs returned..');
        return list;
    }

    /**
     * toggle open or close node childs
     * @param {object} node 
     */
    toggleNode(node) {
        if (node.childs.length > 0) {
            let ie = document.getElementById('i_' + node.id);
            let ule = document.getElementById('c_' + node.id);
            if (node.foldedStatus === false) {
                //change icon
                ie.classList.remove('fa-minus');
                ie.classList.add('fa-plus');
                //hide element
                ule.style.display = 'none';
            } else {
                //change icon
                ie.classList.remove('fa-plus');
                ie.classList.add('fa-minus');
                //show element
                ule.style.display = '';
            }
            node.foldedStatus = !node.foldedStatus;
            //change node status
            for (let key in this.nodeList) {
                if (this.nodeList[key].id === node.id) {
                    this.nodeList[key].foldedStatus = node.foldedStatus;
                }
            }
            this.log('node toggled..');
        } else {
            this.log('node not has childs...!');
        }
    }

    /**
     * remove node from dom
     * @param {object} node 
     */
    deleteNode(node) {
        //remove node from old parent's child data !!!!

        let elm = document.getElementById(node.id);
        let childs = node.getChilds();
        if (childs.length > 0) {
            for (let i = 0; i < childs.length; i++) {
                this.deleteNode(childs[i]);
            }
        }
        elm.parentNode.removeChild(elm);
        this.log('node removed..(' + node.id + ')');
    }

    /**
     * this method will check node and its family.
     * @param {object} node 
     */
    checkNode(node) {
        //change node checked data
        for (let key in this.nodeList) {
            this.nodeList[key].checkStatus = node.checkStatus;
        }
        //then if is checked and folded unfold and open childs
        if (node.checkStatus && node.childs.length > 0) {
            //make element looks like is folded
            node.foldedStatus = true;
            this.toggleNode(node);
        }
        //trigger callback if exists
        if (typeof this.switchCallback == "function") this.switchCallback(node);
        //check html element if family mode is open
        document.getElementById('ck_' + node.id).checked = node.checkStatus;
    }

    /**
     * this method will check node childs and his parents if not checked.
     * @param {object} node 
     */
    checkNodeFamily(node) {
        let parentCheck = async(node) => {
            //first check if has parent
            if (node.parent.id !== 0) {
                //then get parent node
                node = node.parent;
                //change parent node status
                node.checkStatus = true;
                //check parent node
                this.checkNode(node);
                //then restart process
                parentCheck(node);
            }
        }


        let childCheck = async(node) => {
            //first check main node
            this.checkNode(node);
            //then check childs if exist
            if (node.childs.length > 0) {
                //foreach child
                for (let i = 0; i < node.childs.length; i++) {
                    //restart process
                    childCheck(this.getNode(node.childs[i].split('_')[1]));
                }
            }
        }
        if (this.config.autoChild) childCheck(node);
        if (node.checkStatus && this.config.autoParent) parentCheck(node);
    }

    /**
     * this method will unfold all parents of node 
     * @param {object} node 
     */
    async showFamily(node) {
        //check if has parent
        if (node.parent.id !== 0) {
            //then make node status closed
            node.parent.foldedStatus = true;
            //after send parent node for toggle
            this.toggleNode(node.parent);
            //make recursive for another parents
            this.showFamily(node.parent);
        }

    }

    //#endregion


    //#region Node Creator

    /**
     * creating node
     * @param {object} obj
     */
    createNode(obj) {
        let id = Date.now();
        let node = {
            //node value
            value: id,
            //node id
            id: 'node_' + id,
            //node title
            title: 'untitled ' + id,
            //node html elements
            elements: [],
            //node parent element
            parent: { id: 0 },
            // child element ids
            childs: [],
            //childs status (child list opened or not)
            foldedStatus: this.config.foldedStatus,
            //check status for node
            checkStatus: false,
            //this method will return child nodes
            getChilds: () => this.getChilds(node),
            //this method will remove node from dom
            deleteNode: () => this.deleteNode(node),
            //this method will update node
            updateNode: () => this.updateNode(node),
            //this method will toggle node
            toggleNode: () => this.toggleNode(node),
            //this method will show node location
            showFamily: () => this.showFamily(node),
            //check node
            toggleCheck: (status) => {
                node.checkStatus = status;
                this.checkNode(node);
            }

        }

        //check setted values here!!
        for (let key in obj) {
            if (obj[key] !== undefined) node[key.split('_')[1]] = obj[key];
            if (key === 'n_id') node['id'] = 'node_' + obj['n_id'];
        }



        //node is added to container
        this.nodeList[obj['n_id']] = node;
        //node is drawed
        this.drawNode(node);
        //logged
        this.log('Node is created (' + node.id + ')');
        //node is returned
        return node;
    }

    /**
     * this method will update node
     * !! id is recommended
     */
    updateNode(node) {
        //first remove old node
        //console.log(this.getNode(node.id.split('_')[1]))
        this.getNode(node.id.split('_')[1]).deleteNode();
        //clear old parent's childs if old parent info is exist
        if (node.old_parent !== undefined && node.old_parent.id !== 0) {
            this.nodeList[node.old_parent.value].childs = this.nodeList[node.old_parent.value].childs.filter(x => {
                return x !== node.id;
            });
            //if child count is 0 then remove minus icon
            if (this.nodeList[node.old_parent.value].childs.length === 0) {
                document.getElementById('i_' + node.old_parent.id).style.display = 'none';
            }
        }
        //draw new node with childs
        let set = (data) => {
            this.drawNode(data);
            let childs = data.getChilds();
            if (childs.length > 0) {
                for (let i = 0; i < childs.length; i++) {
                    set(childs[i]);
                }

            }
        }
        set(node);
        
        //log
        this.log('Node is created (' + node.id + ')');
        //return node
        return node;
    }


    /**
     * 
     * @param {object} node object for creating html element
     */
    drawNode(node) {
        let icon = this.config.unFoldedIcon;
        let style = '';
        if (node.foldedStatus) {
            icon = this.config.foldedIcon;
            style = 'none';
        }
        //#region elements

        //node li item
        let li_item = document.createElement("li");
        //node a item
        let a_item = document.createElement("a");
        //node i item
        let i_item = document.createElement("i");
        //node ul item
        let ul_item = document.createElement("ul");
        //node group item 
        let div_item = document.createElement("div");

        //make node dragable
        if (this.config.drag) {
            //add drag button to start
            let a_ditem = document.createElement('a');
            let i_ditem = document.createElement('i');
            //set icon drag button
            i_ditem.classList.add('fa');
            i_ditem.classList.add('fa-bars');
            a_ditem.classList.add('drag-handler');


            a_ditem.id = 'a_dr_' + node.id;
            a_ditem.appendChild(i_ditem);
            a_ditem.href = 'javascript:;';
            a_ditem.setAttribute('dragable', true);
            a_ditem.setAttribute('drag-title', node.title)
                //icon added to div
            div_item.appendChild(a_ditem);
            div_item.classList.add('drop_target')
        }

        //set i item id
        i_item.id = 'i_' + node.id;
        //set i item style
        i_item.style.color = 'black';
        //set i item icon
        icon = icon.split(' ');
        for (let i = 0; i < icon.length; i++) {
            i_item.classList.add(icon[i]);
        }
        i_item.style.display = 'none';

        //set ul item id
        ul_item.id = 'c_' + node.id;
        //set ul item style
        ul_item.style.display = style;

        //set a item id
        a_item.id = 'a_toggle_' + node.id;
        //set i tag to a item
        a_item.appendChild(i_item);
        //set a item href
        a_item.href = 'javascript:;';
        //set a_item title
        a_item.innerHTML += ' ' + node.title;

        //set li item id
        li_item.id = node.id;

        div_item.id = 'div_g_' + node.id;
        //set a tag to div item
        div_item.appendChild(a_item);


        //set switch to li item if user is wanted
        if (this.config.switchMode) {
            let sw_item = document.createElement('label');
            let ck_item = document.createElement('input');
            let spn_item = document.createElement('span');
            spn_item.classList.add('slider');
            spn_item.classList.add('round');
            ck_item.type = 'checkbox'
            sw_item.classList.add('switch');

            sw_item.appendChild(ck_item);
            sw_item.appendChild(spn_item);

            //id definitions
            ck_item.id = 'ck_' + node.id;
            sw_item.id = 'sw_' + node.id;

            ck_item.value = node.value;
            //if item created as checked
            ck_item.checked = node.checkStatus;

            //switch is added to li element
            div_item.appendChild(sw_item);
        }
        //if node has extra elements
        if (node.elements.length > 0) {
            //add menu button to end
            let a_item = document.createElement('a');
            let i_item = document.createElement('i');
            //set icon for menu

            for (let i = 0; i < this.config.menuIcon.length; i++) {
                i_item.classList.add(this.config.menuIcon[i]);
            }

            a_item.id = 'a_me_' + node.id;
            a_item.appendChild(i_item);
            a_item.href = 'javascript:;';
            a_item.classList.add('menuIcon');
            //icon added to div
            div_item.appendChild(a_item);

        }

        li_item.appendChild(div_item);
        //set ul tag to li item
        li_item.appendChild(ul_item);

        //#endregion

        //if is main node
        if (node.parent.id === 0) {
            //put item to area
            this.area.appendChild(li_item);
        } else {

            //if has parent set to parents childs
            this.setChildNodes(node);
            //then put item
            document.getElementById('c_' + node.parent.id).appendChild(li_item)
        }


        //set node events
        this.setNodeEvents(node);

        //draw callback  method
        if (typeof this.rowCreateCallback == "function") this.rowCreateCallback(node);
    }

    setNodeEvents(node) {
        //toggle event for node
        document.getElementById('a_toggle_' + node.id).addEventListener('click', e => {
            //toggle item childs
            this.toggleNode(this.getNode(e.currentTarget.id.split('_')[3]));
        });

        //switch event for node
        if (this.config.switchMode) {
            document.getElementById('ck_' + node.id).addEventListener('click', e => {
                let node = this.getNode(e.currentTarget.id.split('_')[2]);
                node.checkStatus = e.currentTarget.checked;
                if (this.config.autoChild || this.config.autoParent) {
                    this.checkNodeFamily(node);
                } else {
                    this.checkNode(node);
                }
            });
        }
    }


    /**
     * this method will draw multiple data 
     */
    drawData() {
        //if data is exist
        if (this.data.length > 0) {
            //first reshape data
            let order = (list, p = { n_id: 0, Child: [] }, tree = []) => {
                let childrens = list.filter(y => y.n_parentid === p.n_id);
                if (childrens.length > 0) {
                    if (p.n_id === 0) {
                        tree = childrens;
                    } else {
                        p['Child'] = childrens
                    }
                    for (let i = 0; i < childrens.length; i++) {
                        order(list, childrens[i]);
                    }
                }
                return tree;
            }

            //then create nodes
            let set = (list) => {
                for (let i = 0; i < list.length; i++) {
                    this.createNode({
                        n_value: list[i].n_id,
                        n_title: list[i].n_title,
                        n_id: list[i].n_id,
                        n_elements: list[i].n_elements,
                        n_parent: this.getNode(list[i].n_parentid),
                        n_checkStatus: typeof list[i].n_checked === 'undefined' ? false : list[i].n_checked
                    });
                    if (list[i].Child) {
                        set(list[i].Child);
                    }
                }
            }

            //start chain
            set(order(this.data));

        }

        //at this point if drag is active we need to create element for dragable element info
        if (this.config.drag) {
            this.div_ddetail = document.createElement('div');
            this.div_ddetail.id = 'div_ddetail';
            this.div_ddetail.style.position = 'absolute';
            this.div_ddetail.style.display = 'none';
            this.div_ddetail.innerHTML = '<span>No Element</span>';
            document.querySelector('body').appendChild(this.div_ddetail);
        }


        //start drawcallback
        this.drawCallback();

    }

    //#endregion

    //#region Menu

    getMenu(element, node) {
        //get element location
        let x = element.getBoundingClientRect();
        let origin = {
            node: node,
            left: x.x,
            top: x.y + x.height
        };
        //draw menu
        this.drawMenu(origin)
    }

    drawMenu(obj) {
        //check if menu already exist
        if (document.getElementById('div_menu_' + obj.node.id) === null) {
            //create menu div
            let menu_item = document.createElement('div');
            //add to body
            document.body.appendChild(menu_item);
            menu_item.id = 'div_menu_' + obj.node.id;
            menu_item.classList.add('menuCont');

            //for each menu item
            let span_item;
            let icon;
            for (let i = 0; i < obj.node.elements.length; i++) {
                span_item = document.createElement('span');
                span_item.setAttribute('data-node', obj.node.id);
                icon = obj.node.elements[i].icon.trim().length > 0 ? '<i class="' + obj.node.elements[i].icon.trim() + '"></i>' : '';
                span_item.innerHTML = icon + ' ' + obj.node.elements[i].title.trim();

                menu_item.appendChild(span_item);

                //then add click event
                span_item.addEventListener('click', e => {
                    obj.node.elements[i].onClick(this.getNode(e.target.getAttribute('data-node').split('_')[1]));
                });
            }
            //calculate location
            if (screen.width - obj.left < menu_item.offsetWidth) {
                menu_item.style.left = (obj.left - menu_item.offsetWidth) + 'px';
            } else {
                menu_item.style.left = obj.left + 'px';
            }
            menu_item.style.top = obj.top + 'px';
        }

    }

    //#endregion
}
