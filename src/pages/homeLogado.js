import Welcome from '../../components/welcome.js';
import IndexOptions from '../../components/index-options.js';
// eu coloquei header, navbar e footer no app.js e ai tirei das outras paginas pra nao duplicar ;)
export default function HomeLogado() {
  return (
    <>
      <main>
        <Welcome></Welcome>
        <IndexOptions></IndexOptions>
      </main>
    </>
  );
}