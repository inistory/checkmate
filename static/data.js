const DATA_URL = "/todo/personal/";
const personal_id = 1;

fetch(DATA_URL+personal_id).then(function(type) {
    console.log(type);
    return type.json();
}).then(function(result) {
    console.log(result); 
    console.log(result.result); 
})