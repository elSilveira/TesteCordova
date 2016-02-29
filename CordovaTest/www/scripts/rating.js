// global variables 
var db; 
var shortName = 'DBSql'; 
var version = '1.0'; 
var displayName = 'DBSql'; 
var maxSize = 65535;
var actualCard;

 
// this is called when an error happens in a transaction 
function errorHandler(transaction, error) { 
    alert('Error: ' + error.message + ' code: ' + error.code); 
} 
 
function successCallBack() { 
    alert("DEBUGGING: success");  
} 

function nullHandler(){}; 


function onLoad(){ 
    
    if (!window.openDatabase) { 
        alert('Browser nao suporta o db.'); 
        return; 
    } 
   //db declarado acima
    db = openDatabase(shortName, version, displayName,maxSize); 
  
 
    db.transaction(function (tx) {
        //tx.executeSql("Delete From Rating");   //Descomente esta linha para limpar o banco de dados.
        tx.executeSql('CREATE TABLE IF NOT EXISTS Rating(Id INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
        'Img BLOB NULL, Value String, Rate INTEGER)',
        [],nullHandler,errorHandler); 
    }, errorHandler, successCallBack);
    ListDBValues();
}  
 
//Função de adicionar imagem ao banco de dados ( NO caso está adicionando somente as já existentes no projet, por isso limitado em 5 )
function AddCard() {
        actualCard++; //Adicionar proxima img

        var img = new Image();
        //Utilizando CANVAS HTML5 para gerar a image em Byte
        img.onload = function (ev, erroShow) {
            var canvas = document.createElement('CANVAS');
            var ctx = canvas.getContext('2d');
            var dataURL;
            canvas.height = this.height;
            canvas.width = this.width;
            ctx.drawImage(this, 0, 0);
            dataURL = canvas.toDataURL("image/jpg"); //Gera o Blob da img
            db.transaction(function (transaction) {
                transaction.executeSql('insert into Rating (Img, Value, Rate) VALUES ("' + dataURL + '", "' + img.name + '", 0);', []);
                ListDBValues();
            });
            canvas = null;

        };
        //Imagens adicionadas manualmente (poderia alterar para buscar local)
        img.name = "card" + actualCard; //Nome do obj, salvo como Value no banco
        img.src = "/images/card" + actualCard + ".jpg"; //Imagem carregada
    
}

//Listagem do banco de dados
function ListDBValues() {
    if (!window.openDatabase) { 
        alert('Browser nao suporta o db.'); 
        return; 
    } 
    $("#dataSite").empty();
    db.transaction(function(transaction) { 
        transaction.executeSql('SELECT * FROM Rating Order by Rate DESC', [],   ///Listando em ordem decrescente de acordo com o Rating
          function(transaction, result) { 
              if (result != null && result.rows != null) { 
                  for (var i = 0; i < result.rows.length; i++) {
                      $("#dataHeader").empty();//removendo mensagem inicial;
                      var row = result.rows.item(i);

                      //Adicionando estrelas de acordo com o Rate ( o 'for' vai adicionar brancas ou marcadas com limite de 5)
                      var stars = "";
                      var position = 1;
                      for (var x = 0; x < row.Rate; x++) {
                          stars += '<img  onClick="StarClick()" id="star' + position + '" name="' + row.Value + '" style="cursor: pointer; display:inline-block; width: 23px;" src="/images/starchecked.png" />';
                          position++;
                      }
                      for (var x = (5 - row.Rate) ; x > 0; x--) {
                          stars += '<img  id="star' + position + '" name="' + row.Value + '" style="cursor: pointer; display:inline-block; width: 23px;" src="/images/star.png" />';
                          position++;
                      }

                      //Dados exibidos em tela (imag/estrelas)
                       var data = '<div id="'+row.Value+'" class="col-md-12" style="text-align: center;">' +
                       '<img style="display:inline-block; width: 80%;" src="'+row.Img+'" /> ' +
                       '<p style="height: 25px;">'+stars+'</p></div>';
                       $("#dataSite").append(data);    
                  }
                  //Para adicionar proxima imagem aqui armazena a última listada
                  actualCard = result.rows.length > 0 ? result.rows.length : 0;
                  //Remove o botão de adicionar imagens se chegou a limite 5
                  if (result.rows.length == 5)
                      $("#addButton").remove();

                  //Função dos botões "estrelas" 
                  //Através do id e da posição de cada item, é armazenado do DB o Rate selecionado
                  $("img").click(function (e) {
                      var x = e.target.src;
                      if (e.target.id.indexOf("star") > -1) {
                         
                          var value = (e.target.id.replace('star', ''));
                          db.transaction(function (tx) {
                              tx.executeSql("UPDATE Rating SET Rate = " + value  + " Where Value = '" + e.target.name+"'");
                          });
                          //Relistagem do banco de dados
                          ListDBValues();
                      }
                  });
              } 
          },errorHandler); 
    },errorHandler,nullHandler); 
     
 
    return; 
 
} 