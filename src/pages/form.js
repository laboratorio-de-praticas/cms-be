import Header from '../../components/header.js'
import Forms from "../../components/formStudent.js";
import Footer from '../../components/footer.js';
import Navbar from '../../components/navbar.js';
// eu coloquei header, navbar e footer no app.js e ai tirei das outras paginas pra nao duplicar ;)

export default function Form(){
    return(
        <>
        <main>
            <br/>
            <Forms />
            <br/>
        </main>
        </>
    )
}