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
        this.area = "";
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
        //order callback
        this.orderCallback = obj.orderCallback;
        //node removed callback
        this.nodeRemove = obj.nodeRemoveCallback;
        //tree json data
        this.data = obj.c_data;
        //build tree
        this.build(obj.c_config);
        //start events
        this.staticEvents();
    }

    /**
     * this method will contains static events for tree
     */
    staticEvents() {
        //close menu
        this.main_container.addEventListener("click", (e) => {
            let elm = e.target;
            //close all first
            document.querySelectorAll(".ptreemenuCont").forEach((menu) => {
                menu.outerHTML = "";
            });
            if (elm.classList.contains("menuIcon")) {
                //menu toggle event for node
                setTimeout(() => {
                    this.getMenu(e.target, this.getNode(elm.id.split("node_")[1]));
                }, 10);
            }
        });

        //drag - drop events
        if (this.config.drag) {
            this.invalid_area = {
                container: null,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            };

            //drag start
            this.main_container.addEventListener("dragstart", async (e) => {
                //give border to container
                //container
                this.invalid_area.container = document.getElementById(this.target + "node_" + e.target.id.split("node_")[1]);
                this.invalid_area.top = this.invalid_area.container.getBoundingClientRect().top;
                this.invalid_area.left = this.invalid_area.container.getBoundingClientRect().left;
                this.invalid_area.right = this.invalid_area.left + this.invalid_area.container.offsetWidth;
                this.invalid_area.bottom = this.invalid_area.top + this.invalid_area.container.offsetHeight;
                setTimeout(() => {
                    this.invalid_area.container.classList.add("valid");
                    this._lock();
                }, 300);
                //drag callback
                if (this.dragCallback) {
                    this.dragCallback(this.nodeList[parseInt(e.target.id.split("node_")[1])]);
                }
                /////// ***** ///////
                //draging
                //clone element when drag start
                const id = e.target.id.split("node_")[1];
                this.clone = document.getElementById(this.target +'node_' + id).cloneNode(true);
                this.clone.style.position = 'absolute';
                this.clone.style.zIndex = 1000;
                this.clone.querySelectorAll('div').forEach(el=>el.style.backgroundColor = 'grey');
                this.clone.querySelectorAll('li').forEach(el=>el.style.border = 'unset !important');
                this.clone.style.width = '50vh';
                //this.clone.querySelector('ul').remove();
                this.clone.querySelectorAll('.switch').forEach(el => el.remove());
                const rul = document.createElement('ul');
                rul.appendChild(this.clone);
                const rdiv = document.createElement('div');
                rdiv.appendChild(rul);
                rdiv.classList.add('dragging-element');
                this.clone = rdiv;

                this.main_container.appendChild(this.clone);
                /////// ***** ///////
            });

            //draging
            this.main_container.addEventListener("drag", (e) => {
                const bounds = e.currentTarget.getBoundingClientRect();
                /////// ***** ///////
                this.clone.style.position = "absolute";
                this.clone.style.left = `${e.clientX - bounds.left + 30}px`;
                this.clone.style.top = `${e.clientY - bounds.top + 30 }px`;
                /////// ***** ///////
            });

            //drag end
            this.main_container.addEventListener("dragend", async (e) => {
                this.clone.remove();
                //console.log('drag end')
                //remove border to container
                this.invalid_area.container.classList.remove("invalid");
                this.invalid_area.container.classList.remove("valid");
                //make all elements pointer clean
                this._lock(false);

                //clear old targets
                this.clearDebris();
                //get node

                const node = this.nodeList[parseInt(e.target.id.split("node_")[1])];

                //check is valid
                node.old_parent = node.parent;
                if (!this.invalid_area.valid) {
                    node.parent = {
                        id: 0
                    };
                } else {
                    console.log('target' , this.drag_target);
                    const drop = this.getNode(this.drag_target);
                    if (this.drag_target === parseInt(e.target.id.split("node_")[1]) || this.drag_target === undefined || drop === undefined || drop.parent.value === node.value) {
                        //this means it dragged to outside
                        node.parent = {
                            id: 0
                        };
                    } else {
                        node.parent = drop;
                    }
                }

                this.nodeList[node.value] = node.updateNode();

                console.log(this.nodeList[node.value]);


                //drop callback
                if (this.dropCallback) {
                    this.dropCallback(node);
                }
            });
            //drag location
            this.main_container.addEventListener("dragenter", (e) => {
                //console.log('drag enter')
                this.clearDebris();
                try {
                    //check position is valid
                    let target = {
                        left: e.target.getBoundingClientRect().left,
                        top: e.target.getBoundingClientRect().top,
                    };

                    if (target.top > this.invalid_area.top && target.top < this.invalid_area.bottom && target.left > this.invalid_area.left && target.left < this.invalid_area.right) {
                        this.invalid_area.valid = false;
                        this.invalid_area.container.classList.add("invalid");
                        this.invalid_area.container.classList.remove("valid");
                    } else {
                        this.invalid_area.valid = true;
                        this.invalid_area.container.classList.remove("invalid");
                        this.invalid_area.container.classList.add("valid");
                    }

                    if (e.target.classList) {
                        if (e.target.classList.contains("drop_target")) {
                            e.target.classList.add("drag_triggered");
                            //this is for updating node parent to current
                            this.drag_target = parseInt(e.target.id.split("node_")[1]);
                        }
                    }
                } catch (e) {
                    //console.log('dragging have exception..');
                    this.drag_target = undefined;
                }
            });
        }
    }

    //#region Helper Methods
    /**
     *
     */
    async destroy() {
        //remove all menus
        document.querySelectorAll(".ptreemenuCont").forEach((menu) => {
            menu.outerHTML = "";
        });
        //remove all items
        document.getElementById(this.target).innerHTML = "";
    }

    /**
     * this method will lock elements when dragging
     */
    async _lock(type = true) {
        const elms = document.querySelectorAll(".drop_target");
        for (let i = 0; i < elms.length; i++) {
            if (type) {
                elms[i].classList.add("disabled");
            } else {
                elms[i].classList.remove("disabled");
            }
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
            key: new Date().getTime(),
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
            foldedIcon: "fa fa-plus",
            //unfold icon
            unFoldedIcon: "fa fa-minus",
            //menu icon
            menuIcon: ["fa", "fa-list-ul"],
            //start status is collapsed or not
            foldedStatus: false,
            //drag
            drag: false,
            //order
            order: false,
        };
        //check config here!!
        for (let key in this.config) {
            if (c_config[key] !== undefined) {
                this.config[key] = c_config[key];
            }
        }
        //check if key is exist somewhere in document
        if (document.getElementById(this.config.key + "_div_pickletree") !== null) {
            this.config.key = new Date().getTime() + 10;
        }
        //referance for some events
        this.main_container = document.getElementById(this.target);
        this.main_container.classList.add('ptree');
        this.main_container.innerHTML = '<div id="' + this.config.key + '_div_pickletree"><ul id="' + this.config.key + '_tree_picklemain"></ul></div>';
        //console.log(this.main_container.getElementById(this.config.key+'_tree_picklemain'));

        this.area = document.getElementById(this.config.key + "_tree_picklemain");
        this.log("tree build started..");
        this.drawData();
    }

    /**
     *
     * @param {integer} id node id for finding node
     */
    getNode(id) {
        this.log("node returned..");
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
                const ic = document.getElementById("i_" + this.nodeList[key].id);
                if (ic !== null) ic.style.display = "";
            }
        }
    }

    /**
     * this method will return switched nodes
     */
    getSelected() {
        let nodes = [];
        //get all checked nodes
        for (let key in this.nodeList) {
            if (this.nodeList[key].checkStatus) nodes.push(this.nodeList[key]);
        }
        return nodes;
    }

    /**
     * this method will reset switched nodes
     */
    resetSelected(type = false) {
        //get all checked nodes
        for (let key in this.nodeList) {
            this.nodeList[key].checkStatus = type;
             this.checkNode(this.nodeList[key]);
        }
        return true;
    }
    //#endregion

    //#region drag - drop events helpers
    /**
     * this method will clean entered areas after drag events
     */
    clearDebris() {
        //first clean all entered areas
        let elms = document.querySelectorAll(".drag_triggered");
        for (let i = 0; i < elms.length; i++) {
            elms[i].classList.remove("drag_triggered");
        }
    }

    //#endregion

    //#region Node Events
    /**
     * this method will order element
     * @param {event} e
     */
    orderNode(e) {
        const isBefore = e.target.dataset.target == 1;
        const main = e.target.parentNode.parentNode.parentNode;
        const target = isBefore ? main.previousElementSibling : main.nextElementSibling;
        //get nodes
        if (target !== null) {
            
            //replace data
            const targetNode = this.getNode(target.id.split("_").at(-1));
            const mainNode = this.getNode(main.id.split("_").at(-1));
            const currentOrder = mainNode.order;
            const targetOrder = targetNode.order === mainNode.order ? (isBefore ? targetNode.order - 1 : targetNode.order + 1) : targetNode.order;
            //change order data
            targetNode.order = currentOrder;
            mainNode.order = targetOrder;

            target.dataset.order = 'order_'+currentOrder;
            main.dataset.order   = 'order_'+targetOrder;

            //replace element
            main.parentNode.replaceChild(main, target);
            main.parentNode.insertBefore(target, isBefore ? main.nextSibling : main);
        }
        if (typeof this.orderCallback == "function") this.orderCallback(main, target);
    }
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
        this.log("node childs returned..");
        return list;
    }

    /**
     * toggle open or close node childs
     * @param {object} node
     */
    toggleNode(node) {
        if (node.childs.length > 0) {
            let ie = document.getElementById("i_" + node.id);
            let ule = document.getElementById("c_" + node.id);
            if (node.foldedStatus === false) {
                //change icon
                ie.classList.remove("fa-minus");
                ie.classList.add("fa-plus");
                //hide element
                //ule.style.display = "none";
                ule.classList.remove("active");
                ule.classList.add("not-active");
            } else {
                //change icon
                ie.classList.remove("fa-plus");
                ie.classList.add("fa-minus");
                //show element
                //ule.style.display = "";
                ule.classList.remove("not-active");
                ule.classList.add("active");
            }
            node.foldedStatus = !node.foldedStatus;
            //change node status
            for (let key in this.nodeList) {
                if (this.nodeList[key].id === node.id) {
                    this.nodeList[key].foldedStatus = node.foldedStatus;
                }
            }
            this.log("node toggled..");
        } else {
            this.log("node not has childs...!");
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
        //remove node from container
        //delete this.nodeList[node.value];

        if (elm !== null) elm.parentNode.removeChild(elm);
        this.log("node removed..(" + node.id + ")");
        if (this.nodeRemove !== undefined) this.nodeRemove(node);
    }

    /**
     * this method will check node and its family.
     * @param {object} node
     */
    checkNode(node) {
        //console.log(node);
        //then if is checked and folded unfold and open childs
        let clength = node.childs.length;
        if (node.checkStatus && clength > 0) {
            //make element looks like is folded
            node.foldedStatus = true;
            this.toggleNode(node);
        }
        //trigger callback if exists
        if (typeof this.switchCallback == "function") this.switchCallback(node);
        //check html element if family mode is open
        document.getElementById("ck_" + node.id).checked = node.checkStatus;
    }

    /**
     * this method will check node childs and his parents if not checked.
     * @param {object} node
     */
    checkNodeFamily(node) {
        let status = node.checkStatus;
        let parentCheck = async (node) => {
            //first check if has parent
            if (node.parent.id !== 0) {
                //get parent node
                node = node.parent;
                let trans = () => {
                    //change parent node status
                    node.checkStatus = status;
                    //check parent node
                    this.checkNode(node);
                    //then restart process
                    parentCheck(node);
                };
                //decide for uncheck
                if (!status) {
                    //if all childs is unchecked or child count is equal to 1
                    let valid = true;
                    let childs = node.getChilds();
                    for (let i = 0; i < childs.length; i++) {
                        if (childs[i].checkStatus) {
                            valid = false;
                        }
                    }
                    if (valid) trans();
                } else {
                    trans();
                }
            }
        };

        let childCheck = async (node) => {
            //first check main node
            this.checkNode(node);
            //then check childs if exist
            if (node.childs.length > 0) {
                //foreach child
                for (let i = 0; i < node.childs.length; i++) {
                    let c_node = this.getNode(node.childs[i].split("node_")[1]);
                    c_node.checkStatus = status;
                    //restart process
                    childCheck(c_node);
                }
            }
        };
        if (this.config.autoChild) childCheck(node);
        if (this.config.autoParent) parentCheck(node);
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
        const id = Date.now();
        const node = {
            //node value
            value: id,
            //node id
            id: this.target + "node_" + id,
            //node title
            title: "untitled " + id,
            //node html elements
            elements: [],
            //order number
            order: null,
            //node parent element
            parent: {
                id: 0
            },
            // child element ids
            childs: [],
            //addional info
            addional: {},
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
            },
            //scroll to node
            scroll:() => document.getElementById(node.id).scrollIntoView(),
            //find child nodes from text
            find  :(text) => {
                const nodes = [];
                document.getElementById(node.id).querySelectorAll('li').forEach(el=>{
                    if(el.innerHTML.includes(text)){
                        nodes.push(this.getNode(el.id.split("node_")[1]))
                    }
                });
                return nodes;
            }
        };

        //check setted values here!!
        for (let key in obj) {
            if (obj[key] !== undefined) node[key.split("_")[1]] = obj[key];
            if (key === "n_id") node["id"] = this.target + "node_" + obj["n_id"];
        }

        if (node.order === null) node.order = 0;

        //node is added to container
        this.nodeList[obj["n_id"]] = node;
        //node is drawed
        this.drawNode(node);
        //logged
        this.log("Node is created (" + node.id + ")");
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
        this.getNode(node.id.split("node_")[1]).deleteNode();
        //clear old parent's childs if old parent info is exist
        if (node.old_parent !== undefined && node.old_parent.id !== 0) {
            this.nodeList[node.old_parent.value].childs = this.nodeList[node.old_parent.value].childs.filter((x) => {
                return x !== node.id;
            });
            //if child count is 0 then remove minus icon
            if (this.nodeList[node.old_parent.value].childs.length === 0) {
                document.getElementById("i_" + node.old_parent.id).style.display = "none";
            }
        }
        //draw new node with childs
        const set = (data) => {
            this.drawNode(data);
            let childs = data.getChilds();
            if (childs.length > 0) {
                for (let i = 0; i < childs.length; i++) {
                    set(childs[i]);
                }
            }
        };

        set(node);

        //log
        this.log("Node is created (" + node.id + ")");
        //return node
        return node;
    }

    /**
     *
     * @param {object} node object for creating html element
     */
    drawNode(node) {
        let icon = this.config.unFoldedIcon;
        let style = "";
        let defaultClass = "active";

        if (node.foldedStatus) {
            icon = this.config.foldedIcon;
            style = "none";
            defaultClass = "not-active";
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

        //make node ordarable
        if (this.config.order) {
            const o_div = document.createElement("div");
            o_div.id = "order_" + node.id;
            //create buttons
            const up_i = document.createElement("i");
            const dw_i = document.createElement("i");

            o_div.classList.add("ptree_order_div");

            up_i.classList.add("fa", "fa-arrow-up");
            up_i.dataset.target = "1";
            dw_i.classList.add("fa", "fa-arrow-down");
            dw_i.dataset.target = "0";

            o_div.appendChild(up_i);
            o_div.appendChild(dw_i);
            //ordering event
            o_div.onclick = (e) => (e.target.tagName == "I" ? this.orderNode(e) : false);

            div_item.appendChild(o_div);
        }

        //make node dragable
        if (this.config.drag) {
            //add drag button to start
            const a_ditem = document.createElement("a");
            const i_ditem = document.createElement("i");
            //set icon drag button
            i_ditem.classList.add("fa");
            i_ditem.classList.add("fa-bars");
            a_ditem.classList.add("drag-handler");

            a_ditem.id = "a_dr_" + node.id;
            a_ditem.appendChild(i_ditem);
            a_ditem.href = "javascript:;";
            a_ditem.setAttribute("dragable", true);
            a_ditem.setAttribute("drag-title", node.title);
            //icon added to div
            div_item.appendChild(a_ditem);
            div_item.classList.add("drop_target");
        }

        //set i item id
        i_item.id = "i_" + node.id;
        //set i item style
        i_item.style.color = "black";
        //set i item icon
        icon = icon.split(" ");
        for (let i = 0; i < icon.length; i++) {
            i_item.classList.add(icon[i]);
        }
        i_item.style.display = "none";

        //set ul item id
        ul_item.id = "c_" + node.id;

        //set ul item style
        //ul_item.style.display = style;

        //set ul item class
        ul_item.classList.add(defaultClass);

        //set a item id
        a_item.id = "a_toggle_" + node.id;
        //set i tag to a item
        a_item.appendChild(i_item);
        //set a item href
        a_item.href = "javascript:;";
        //set a_item title
        a_item.innerHTML += " " + node.title;

        a_item.onclick = (e) => this.toggleNode(node);

        //set li item id
        li_item.id = node.id;
        li_item.dataset.order = "order_" + node.order;

        div_item.id = "div_g_" + node.id;
        //set a tag to div item
        div_item.appendChild(a_item);

        //set switch to li item if user is wanted
        if (this.config.switchMode) {
            const sw_item = document.createElement("label");
            const ck_item = document.createElement("input");
            const spn_item = document.createElement("span");
            spn_item.classList.add("slider");
            spn_item.classList.add("round");
            ck_item.type = "checkbox";
            sw_item.classList.add("switch");

            sw_item.appendChild(ck_item);
            sw_item.appendChild(spn_item);

            //id definitions
            ck_item.id = "ck_" + node.id;
            sw_item.id = "sw_" + node.id;

            ck_item.value = node.value;
            //if item created as checked
            ck_item.checked = node.checkStatus;

            ck_item.onclick = (e) => {
                node.checkStatus = e.target.checked;
                if (this.config.autoChild || this.config.autoParent) {
                    this.checkNodeFamily(node);
                }else{
                    this.checkNode(node);
                }
                
            };

            //switch is added to li element
            div_item.appendChild(sw_item);
        }
        //if node has extra elements
        if (node.elements.length > 0) {
            //add menu button to end
            let a_item = document.createElement("a");
            let i_item = document.createElement("i");
            //set icon for menu

            for (let i = 0; i < this.config.menuIcon.length; i++) {
                i_item.classList.add(this.config.menuIcon[i]);
            }

            a_item.id = "a_me_" + node.id;
            a_item.appendChild(i_item);
            a_item.href = "javascript:;";
            a_item.classList.add("menuIcon");
            //icon added to div
            div_item.appendChild(a_item);
        }

        li_item.appendChild(div_item);
        //set ul tag to li item
        li_item.appendChild(ul_item);

        //#endregion

        //if is main node
        //check if element is exist for preventing copy elements
        if (node.parent.id === 0) {
            //put item to area
            this.area.appendChild(li_item);
        } else {
            //if has parent set to parents childs
            this.setChildNodes(node);
            //then put item
            const cont = document.getElementById("c_" + node.parent.id);
            if (cont !== null) cont.appendChild(li_item);
        }

        //node.element = li_item;

        //set node events
        this.setNodeEvents(node, div_item);

        //draw callback  method
        if (typeof this.rowCreateCallback == "function") this.rowCreateCallback(node);
    }

    setNodeEvents(node, parent) {
        //order event for node
        if (this.config.order) {
            document.getElementById('order_' + node.id).addEventListener('click', e => {
                if (e.target.tagName == 'I') {
                    const isBefore = e.target.dataset.target == 1;
                    const main = e.target.parentNode.parentNode.parentNode;
                    const target = isBefore ? main.previousElementSibling : main.nextElementSibling;
                    //get nodes
                    if (target !== null) {
                        //replace data
                        const targetNode = this.getNode(target.id.split("_").at(-1));
                        const mainNode = this.getNode(main.id.split("_").at(-1));
                        //console.log( mainNode.order,targetNode.order);
                        const currentOrder = mainNode.order;
                        const targetOrder = targetNode.order === mainNode.order ? (isBefore ? targetNode.order - 1 : targetNode.order + 1) : targetNode.order;
                        //change order data
                        targetNode.order = currentOrder;
                        mainNode.order = targetOrder;
                        //console.log( mainNode.order,targetNode.order);
                        //replace element
                        main.parentNode.replaceChild(main, target);
                        main.parentNode.insertBefore(target, isBefore ? main.nextSibling : main);
                    }
                }

            });
        }
    }

    /**
     * this method will draw multiple data
     */
    drawData() {
        //start loading

        //if data is exist
        if (this.data.length > 0) {
            //first reshape data
            let order = (list, p = {
                n_id: 0,
                Child: []
            }, tree = []) => {
                let childrens = list.filter((y) => parseInt(y.n_parentid) === parseInt(p.n_id));
                if (childrens.length > 0) {
                    // order items by order_num param if exist
                    childrens.sort((a, b) => parseFloat(a.n_order_num === undefined ? 0 : a.n_order_num) - parseFloat(b.n_order_num === undefined ? 0 : b.n_order_num));
                    if (p.n_id === 0) {
                        tree = childrens;
                    } else {
                        p.Child = childrens;
                    }
                    for (let i = 0; i < childrens.length; i++) {
                        order(list, childrens[i]);
                    }
                }
                return tree;
            };

            //then create nodes
            let set = (list) => {
                for (let i = 0; i < list.length; i++) {
                    this.createNode({
                        n_data: list[i],
                        n_addional: list[i].n_addional,
                        n_value: list[i].n_id,
                        n_title: list[i].n_title,
                        n_id: list[i].n_id,
                        n_elements: list[i].n_elements,
                        n_parent: this.getNode(list[i].n_parentid),
                        n_checkStatus: list[i].n_checkStatus === undefined ? false : list[i].n_checkStatus,
                        n_order: list[i].n_order_num,
                    });
                    if (list[i].Child) {
                        set(list[i].Child);
                    }
                }
            };
            //start chain
            set(order(this.data));
        }

        //start drawcallback
        if (this.drawCallback !== undefined) this.drawCallback();
        //end loading
    }

    //#endregion

    //#region Menu

    getMenu(element, node) {
        //get element location
        let x = element.getBoundingClientRect();
        const origin = {
            node: node,
            left: x.x,
            top: x.y + x.height,
        };
        //draw menu
        this.drawMenu(origin);
    }

    drawMenu(obj) {
        //check if menu already exist
        if (document.getElementById("div_menu_" + obj.node.id) === null) {
            //create menu div
            const menu_item = document.createElement("div");
            //add to body
            document.body.appendChild(menu_item);
            menu_item.id = "div_menu_" + obj.node.id;
            menu_item.classList.add("ptreemenuCont");

            //for each menu item
            let span_item;
            let icon;
            for (let i = 0; i < obj.node.elements.length; i++) {
                span_item = document.createElement("span");
                span_item.setAttribute("data-node", obj.node.id);
                icon = obj.node.elements[i].icon.trim().length > 0 ? '<i class="' + obj.node.elements[i].icon.trim() + '"></i>' : "";
                span_item.innerHTML = icon + " " + obj.node.elements[i].title.trim();

                menu_item.appendChild(span_item);

                //then add click event
                span_item.addEventListener("click", (e) => {
                    obj.node.elements[i].onClick(this.getNode(e.target.getAttribute("data-node").split("node_")[1]));
                    //remove menu after click
                    menu_item.outerHTML = "";
                });
            }
            //calculate location
            if (screen.width - obj.left < menu_item.offsetWidth) {
                menu_item.style.left = obj.left - menu_item.offsetWidth + "px";
            } else {
                menu_item.style.left = obj.left + "px";
            }
            menu_item.style.top = obj.top + "px";

            // listen mouse out
            menu_item.onmouseleave = (e) => {
                menu_item.remove();
            };
        }
    }

    //#endregion
}
