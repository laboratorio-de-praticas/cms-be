import { openDb } from "@/lib/db";

export async function POST(request) {
  try {
   
    const formData = await request.formData();
    
    const ra = formData.get('ra');
    const email_institucional = formData.get('email_institucional');

    // Validação básica
    if (!ra || !email_institucional) {
      return new Response(
        JSON.stringify({ 
          error: "RA e email institucional são obrigatórios",
          received: {
            ra: ra ? 'present' : 'missing',
            email: email_institucional ? 'present' : 'missing'
          }
        }), 
        { status: 400 }
      );
    }

    // Verifica se os valores são strings
    if (typeof ra !== 'string' || typeof email_institucional !== 'string') {
      return new Response(
        JSON.stringify({ 
          error: "RA e email devem ser strings",
          received: {
            ra_type: typeof ra,
            email_type: typeof email_institucional
          }
        }),
        { status: 400 }
      );
    }

    const email = email_institucional.toLowerCase().trim();
    
    // Verifica domínio do email
    if (!email.endsWith('@fatec.sp.gov.br')) {
      return new Response(
        JSON.stringify({ 
          error: "Apenas emails institucionais @fatec.sp.gov.br têm permissão",
          received_email: email_institucional
        }),
        { status: 403 }
      );
    }

    const db = await openDb();

    const usuario = await db.get(
      `SELECT ra, email_institucional FROM Candidatos 
       WHERE ra = ? AND LOWER(email_institucional) = ?`,
      [ra.trim(), email]
    );

    if (!usuario) {
      return new Response(
        JSON.stringify({ 
          error: "Combinação RA/Email não encontrada",
          suggestion: "Verifique se os dados estão corretos"
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        ra: usuario.ra,
        email: usuario.email_institucional,
        message: "Acesso permitido"
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Erro no servidor:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro interno no servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      }),
      { status: 500 }
    );
  }
}