let cart = [];

// ADD
function addToCart(btn){
    const el = btn.closest(".item");

    const item = {
        name: el.dataset.name,
        price: parseInt(el.dataset.price),
        img: el.dataset.img,
        qty: 1
    };

    const exist = cart.find(p => p.name === item.name);

    if(exist) exist.qty++;
    else cart.push(item);

    renderCart();
}

// RENDER
function renderCart(){

    const box = document.getElementById("cartItems");
    const count = document.getElementById("cartCount");
    const total = document.getElementById("total");

    count.textContent = cart.reduce((s,p)=>s+p.qty,0);

    if(cart.length === 0){
        box.innerHTML = "<p>Empty</p>";
        total.textContent = "0 DA";
        return;
    }

    let sum = 0;

    box.innerHTML = cart.map((p,i)=>{
        sum += p.price * p.qty;

        return `
        <div>
            <img src="${p.img}" width="50">
            ${p.name} - ${p.price * p.qty} DA
            <button onclick="removeItem(${i})">X</button>
        </div>`;
    }).join("");

    total.textContent = sum + " DA";
}

// REMOVE
function removeItem(i){
    cart.splice(i,1);
    renderCart();
}

// CART
function openCart(){
    document.getElementById("cartBox").style.display="block";
}

// ORDER
function openOrder(){
    if(cart.length===0){
        alert("Cart empty");
        return;
    }

    document.getElementById("orderModal").style.display="block";

    document.getElementById("productList").textContent =
        cart.map(p=>p.name).join(", ");

    document.getElementById("productTotal").textContent =
        cart.reduce((s,p)=>s+p.price*p.qty,0)+" DA";
}

function closeOrder(){
    document.getElementById("orderModal").style.display="none";
}

// SEND (to PHP)
function sendOrder(){

    fetch("she.php",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            action:"order",
            items:cart,
            total:cart.reduce((s,p)=>s+p.price*p.qty,0),
            name:document.getElementById("name").value,
            phone:document.getElementById("phone").value,
            wilaya:document.getElementById("wilaya").value
        })
    })
    .then(r=>r.json())
    .then(d=>{
        alert(d.success ? "Order sent ✔" : "Error");
        cart=[];
        renderCart();
        closeOrder();
    });
}




