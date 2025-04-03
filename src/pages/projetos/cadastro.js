import { useState } from 'react';
import { useRouter } from 'next/router';

export default function CadastroProjeto() {
  const router = useRouter();
  const [carregando, set_carregando] = useState(false);
  const [mensagem, set_mensagem] = useState('');

  const enviar_formulario = async (evento) => {
    evento.preventDefault();
    set_carregando(true);
    set_mensagem('');

    try {
      const form_data = new FormData(evento.target);
      
      // Arrays estáticos para teste
      const ods_ids = ['1', '2'];
      const linha_extensao_ids = ['1'];
      const area_tematica_ids = ['1'];
      
      form_data.append('ods_ids', JSON.stringify(ods_ids));
      form_data.append('linha_extensao_ids', JSON.stringify(linha_extensao_ids));
      form_data.append('area_tematica_ids', JSON.stringify(area_tematica_ids));

      const resposta = await fetch('/api/Projetos/Create', {
        method: 'POST',
        body: form_data,
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao cadastrar projeto');
      }

      set_mensagem('Projeto cadastrado com sucesso!');
      

    } catch (erro) {
      set_mensagem(`Erro: ${erro.message}`);
    } finally {
      set_carregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
                  Cadastro de Projeto
                </h2>

                <form onSubmit={enviar_formulario} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nome do Projeto
                    </label>
                    <input
                      type="text"
                      name="nome_Projeto"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nome da Equipe
                    </label>
                    <input
                      type="text"
                      name="nome_equipe"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      TLR (Technology Readiness Level)
                    </label>
                    <input
                      type="number"
                      name="tlr"
                      min="0"
                      max="9"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      CEA (Critério de Excelência Acadêmica)
                    </label>
                    <input
                      type="number"
                      name="cea"
                      min="0"
                      max="100"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Área de Atuação
                    </label>
                    <input
                      type="text"
                      name="area_atuacao"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descrição
                    </label>
                    <textarea
                      name="descricao"
                      required
                      rows="3"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Imagem de Capa
                    </label>
                    <input
                      type="file"
                      name="imagem_capa"
                      accept="image/*"
                      required
                      className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Turma
                    </label>
                    <input
                      type="text"
                      name="turma"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Campos que serão implementados posteriormente como selects múltiplos
                  <div>
                    <label>ODS</label>
                    <select multiple name="ods_ids">...</select>
                  </div>

                  <div>
                    <label>Linhas de Extensão</label>
                    <select multiple name="linha_extensao_ids">...</select>
                  </div>

                  <div>
                    <label>Áreas Temáticas</label>
                    <select multiple name="area_tematica_ids">...</select>
                  </div>
                  */}

                  <div className="pt-5">
                    <button
                      type="submit"
                      disabled={carregando}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                    >
                      {carregando ? 'Cadastrando...' : 'Cadastrar Projeto'}
                    </button>
                  </div>
                </form>

                {mensagem && (
                  <div className={`mt-4 p-4 rounded-md ${
                    mensagem.includes('Erro') 
                      ? 'bg-red-50 text-red-700' 
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {mensagem}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 