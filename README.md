

# Pickle Tree

> Pickle tree is a tree component written as completely javascript. Just put json file to class constructor and have fun :-D 

> falan böyle gibi gereksiz

**Badges will go here**

- falan
- böyle
- gibi 
- gereksiz




## Example (Optional)

```javascript
// code away!

const tree = new PickleTree({
        c_target: 'div_tree',
        c_logMode: false,
        c_startStatus: true,
        c_switchMode: true,
        //rowCreateCallback: (node) => {},
        switchCallback:(node) => console.log(node),
        drawCallback: () => {
            console.log('tree drawed ..');
        },
        c_config : {
            foldedStatus:true
        },
        c_data: [{
            n_id: 1,
            n_title: 'falan1',
            n_parentid: 0,
            n_checked:true
        }, {
            n_id: 2,
            n_title: 'falan2',
            n_parentid: 0
        }, {
            n_id: 3,
            n_title: 'falan3',
            n_parentid: 0
        }, {
            n_id: 4,
            n_title: 'falan1-1',
            n_parentid: 1
        }, {
            n_id: 5,
            n_title: 'falan1-2',
            n_parentid: 1
        }, {
            n_id: 6,
            n_title: 'falan2-1',
            n_parentid: 2
        }, {
            n_id: 7,
            n_title: 'falan2-2',
            n_parentid: 2
        }, {
            n_id: 8,
            n_title: 'falan2-3',
            n_parentid: 2
        }
        , {
            n_id: 9,
            n_title: 'falan2-3',
            n_parentid: 5
        }]
    });
```

---

## Installation

- All the `code` required to get started
- Images of what it should look like

### Clone

- Clone this repo to your local machine using `https://github.com/fvcproductions/SOMEREPO`

