export default function TesteAPI() {
    async function handleSubmit() {
      const res = await fetch('/api/candidatos/registro', {
        method: 'POST',
        body: JSON.stringify({
          name: "Teste",
          emailPrefix: "teste",
          password: "123"
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      console.log(data);
    }
  
    return <button onClick={handleSubmit}>Testar API</button>;
  }