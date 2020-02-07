const ListaDeTarefas = artifacts.require('./ListaDeTarefas.sol');

module.exports = function(implatador) {
	 implatador.deploy(ListaDeTarefas);
};
