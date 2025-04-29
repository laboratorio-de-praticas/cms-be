const Table=()=>{
    return(
        <div className='container'>
            <table className="table">
                <thead className='text-center'>
                    <tr>
                    <th scope="col">RA</th>
                    <th scope="col">Nome</th>
                    <th scope="col">Email Institucional</th>
                    <th scope="col">Telefone</th>
                    <th scope="col">Curso</th>
                    <th scope="col">Ano de Ingresso</th>
                    <th scope="col">Semestre Atual</th>
                    <th colspan='2'>Ações</th>
                    </tr>
                </thead>
                <tbody className="table-group-divider">
                    <tr>
                        <td className='fw-bold'>1</td>
                        <td>Mark</td>
                        <td>mark.zellin01@fatec.sp.gov.br</td>
                        <td>(13)99999-9999</td>
                        <td>DSM</td>
                        <td>2023/2</td>
                        <td>DSM 5</td>
                        <td><a href=''>Edit</a></td>
                        <td><a href=''>Del</a></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
export default Table