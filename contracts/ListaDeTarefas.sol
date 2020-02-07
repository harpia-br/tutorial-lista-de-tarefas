pragma solidity ^0.5.0;

contract ListaDeTarefas {
	uint public contagemDeTarefas = 0;

	struct Tarefa {
	uint id;
	string conteudo;
	bool completada;
	}

	mapping(uint => Tarefa) public tarefas;

	function criarTarefa(string memory _conteudo) public {
	contagemDeTarefas ++;
	tarefas[contagemDeTarefas] = Tarefa(contagemDeTarefas, _conteudo, false);
	}

	constructor() public {
	criarTarefa('Acesse programadorblockchain.com.br');
	criarTarefa('Criar aplicação web para acessar nosso contrato');
	}

	function alternarCompletada(uint _id) public {
	Tarefa memory _tarefa = tarefas[_id];
	_tarefa.completada = !_tarefa.completada;
	tarefas[_id] = _tarefa;
	}
}
