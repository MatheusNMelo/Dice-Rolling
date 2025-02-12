Este é o repositorio do projeto Beacon Dice.
Aqui é possivel encontrar a implementação de um aplicação web que faz uso de pulsos de um beacon dice para gerar jogos de azar.
Também uma implementação de um Beacon local encontrado no beacon.py
Nos arquivos local-results.csv e nist-results.csv são encontrados os dados usados no presentations.ipynb
O test-suit.py define os testes utilizados durante o projeto.

Para executar este código é necessario previamente fazer a execução do enviroment python "source /env/bin/activate".
após ingressar no enviroment é necessario executar o servidor via "node server/server.js"
e finalmente executar o comando "npm start" no diretorio raiz do projeto.

O código do beacon local se encontra no Diretório /beacon.py
e a bateria de testes executada para validação se encontra em /test-suit.py