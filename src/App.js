/* Biblioteca para criar nossos componentes */
import React from 'react';
/* Biblioteca para acessar contratos na rede Ethereum */
import Web3 from 'web3';
/* Importando o contrato */
import ListaDeTarefas from './abis/ListaDeTarefas.json'
/* Componentes para nossa aplicação web */
import {
	Table,
	Container,
	Form,
	Button,
	InputGroup,
	FormControl,
} from 'react-bootstrap'

/* Declaração do nosso componente */
class App extends React.Component {

	/* Alguns componentes React tem um 'estado', com dados, 
	 * para controlar a renderização do componente */
	state = {
		/* Variável para manejar o processamento dos dados */
		carregando: true,
		/* Variável para guardar a lista de tarefas dentro do contrato */
		tarefas: [],
		/* Variável para guardar a conta que está selecionada no Metamask */
		conta: null,
		/* Variável para receber o conteúdo da nova tarefa */
		novoConteudo: '',
		/* Variável para guardar o contrato que vamos utilizar */
		contrato: null,
	}

	/* Função que participa do ciclo de vida do componente com estado,
	 * ela é chamada quando o componente está montado, essa no caso é
	 * ideal para fazer solicitações assíncronas, palavra chave 'async' 
	 * facilita o trabalho com funções assíncronas, fazendo parte da ES7
	 * do JavaScript */
	async componentDidMount() {
		/* Todas as solicitações Web3 são assíncronas e o uso do ES7 async await
		 * ajuda muito a reduzir o código e facilita a manutenção */

		/* Criando uma instância do Web3 */
		let web3 = null
		/* Browser novos já tem acesso a rede Ethereum, como Mist ou Metamask */
		if(window.ethereum){
			web3 = new Web3(window.ethereum)
			await window.ethereum.enable()
		}else{
			/* Acessando a extensão de acesso a rede Ethereum */
			if(window.web3){
				web3 = new Web3(Web3.givenProvider)
			}else{
				alert('Ethereum browser não detectado! Tente usar o Metamask')
				return false
			}
		}

		/* Pega as contas que estão no caso no Metamask e traz a selecionada */
		const contas = await web3.eth.getAccounts()
		const conta = contas[0]
		/* Dados da rede que estamo conecta no caso a rede Ganache */
		const rede_id = await web3.eth.net.getId()
		const dadosRede = ListaDeTarefas.networks[rede_id]
		if(dadosRede){
			/* Pegando o contrato com o arquivo gerado pelo Truffle e o endereço da nossa rede */
			const contratoListaDeTarefas = new web3.eth.Contract(ListaDeTarefas.abi, dadosRede.address)
			/* buscando as tarefas dentro do contrato */
			const tarefas = await this.buscarTarefas(contratoListaDeTarefas)
			/* A função setState() alterar o estado do objeto, quando o estado é diferente do atual 
			 * o algoritmo de reconciliciação do React avalia o que vai mudar na redenrização e altera
			 * apenas aquela informação, esse é o que faz O react tão diferente e poderoso */
			this.setState({
				carregando: false,
				tarefas,
				contrato: contratoListaDeTarefas,
				conta,
			})
		}else{
			alert('Contrato ListaDeTarefas não está implementado!')
		}
	}

	/* No React podemos controlar nosso formulário para não ter a necessidade de submeter o mesmo,
	 * além de poder filtrar os dados passado pela entrada de dados e quem altera o que é mostrado 
	 * é o algoritmo de reconciliação */
	alterarCampo = event => {
		/* Desestruturação do objeto para por os dados já em variáveis utilizad pelo ES6*/
		const {
			value,
			name,
		} = event.target
		this.setState({ [name]: value })
	}

	criarTarefa = async () => {
		const {
			contrato,
			novoConteudo,
			conta,
		} = this.state
		if(novoConteudo === ''){
			alert('Informe o conteúdo')
			return false
		}
		try{
			this.setState({carregando: true})
			/* Acesso aos métodos públicos do contrato, quando um método altera o estado
			 * do contrato usa-se o método 'send' com a conta do usuário selecionado 
			 * no Metamask além de usar 'Gas Fee', seria como a taxa de processamento,
			 * como por exemplo quando você faz uma compra na internet além do valor do
			 * produto paga-se a taxa de entrega que também é paga em valor por isso,
			 * na rede Ethereum a moeda é o Ether e o Gas seria uma fração de Ether,
			 * essa taxa é paga para quem faz o processamento, chamado de mineradores,
			 * ao chamar essa função um notificação do MetaMask mostra-rá os valores e
			 * se você aceita essa transação ou não */

			await contrato.methods.criarTarefa(novoConteudo).send({from: conta})
			/* Logo depois de criar uma nova tarefa, buscar as tarefas do contrao e
			 * submetido ao estado para que o React faça a alteração da renderização */
			const tarefas = await this.buscarTarefas(contrato)
			this.setState({
				tarefas,
				novoConteudo: '',
				carregando: false,
			})
		} catch (error) {
			/* Caso seja rejeitada a transação volta ao estado anterior */
			this.setState({
				carregando: false,
				novoConteudo: '',
			})
			alert('Transação Rejeitada!')
		}
	}

	buscarTarefas = async (contrato) => {
		/* Como buscar tarefas que estão nos contratos não alterar o estado do mesmo,
		 * então é usado a função 'call' */
		const contagemDeTarefas = await contrato.methods.contagemDeTarefas().call()
		const tarefas = []
		for (let i = 1;i <= contagemDeTarefas ; i++) {
			tarefas.push(await contrato.methods.tarefas(i).call())
		}
		return tarefas	
	}

	alternarCompletada = async (id) => {
		const {
			contrato,
			conta,
		} = this.state
		try{
			this.setState({carregando: true})
			/* A mesma forma de uso como o método 'criarTarefa' */
			await contrato.methods.alternarCompletada(id).send({from: conta})
			const tarefas = await this.buscarTarefas(contrato)
			this.setState({
				tarefas,
				carregando: false,
			})
		} catch (error) {
			this.setState({
				carregando: false,
			})
			alert('Transação Rejeitada!')
		}
	}

	/* Função que informa ao React o que criar usando JSX, que facilita a criação
	 * de componentes que é justamente o uso de tags informa ao tradutor Babel para
	 * gerar um código Javascript ao executar a classe */
	render(){
		const {
			carregando,
			tarefas,
			novoConteudo,
			contrato,
		} = this.state
		return (
			<Container
				style={{
					textAlign: 'center',
					borderWidth: '.2rem .2rem 0',
					borderRadius: '8px 8px 0 0',
					sition: 'relative',
					padding: '1rem',
					border: '.2rem solid #ececec',
					color: '#212529',
					marginTop: 20,
				}}>
				<h1>Lista de Tarefas na Blockchain</h1>
				{
					contrato && 
						!carregando && 
						<Form>
							<Form.Group>
								<Form.Label>Adicionar Nova Tarefa</Form.Label>
								<InputGroup className="mb-3">
									<FormControl
										placeholder="Novo Conteúdo"
										id='novoConteudo'
										name='novoConteudo'
										value={novoConteudo}
										onChange={this.alterarCampo}
									/>
									<InputGroup.Append>
										<Button 
											onClick={this.criarTarefa}
											variant="outline-secondary">
											Criar nova Tarefa
										</Button>
									</InputGroup.Append>
								</InputGroup>
							</Form.Group>
						</Form>
				}
				{
					carregando &&
						<h2>Carregando...</h2>
				}
				{
					!carregando &&
						tarefas &&
						<Table striped bordered hover>
							<tbody>
								{
									tarefas.map(tarefa => {
										return <tr key={tarefa.id}>
											<td>{tarefa.conteudo}</td>
											<td>
												<input
													type='checkbox'
													defaultChecked={tarefa.completada}
													onClick={() => this.alternarCompletada(parseInt(tarefa.id))}
												/>
											</td>
										</tr>
									})
								}
							</tbody>
						</Table>
				}
			</Container>
		);
	}
}

export default App;
