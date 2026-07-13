const notificationTemplete = {
    "new_item":{
        title:"New item added",
        body: ( item_title)=>{
           return `New item has been added ${item_title}`
        }
    },
      "new_order":{
        title:"New order placed",
        body: (order_id)=>{
           return `New order has been placed ${order_id} `
        }
      }
}
export default notificationTemplete