import type { LegalDocument } from './types';

/**
 * Aviso de Privacidad vigente (versión del 08 de julio de 2026).
 *
 * Transcripción del documento firmado. No lo edites para "mejorar la
 * redacción": cualquier cambio de fondo tiene que venir de una versión nueva
 * del documento, y entonces se actualiza también `lastUpdated`.
 */
export const PRIVACY_POLICY: LegalDocument = {
  title: 'AVISO DE PRIVACIDAD',
  lastUpdated: '08 de julio de 2026',
  intro: [
    {
      type: 'p',
      text: 'En Goryuz, tu estilo comienza por tu propio armario. Nuestra plataforma utiliza inteligencia artificial para transformar las fotografías de tus prendas en propuestas de atuendos pensadas para ti. Para ofrecerte esta experiencia, es necesario tratar ciertos datos personales, y consideramos que mereces una explicación clara y precisa de cómo lo hacemos. El presente aviso se emite en cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), su Reglamento y los Lineamientos del Aviso de Privacidad emitidos por el INAI. Te invitamos a revisarlo con detenimiento.',
    },
  ],
  sections: [
    {
      title: '1. ¿Quiénes somos?',
      blocks: [
        {
          type: 'p',
          text: 'Goryuz es la empresa responsable del tratamiento de tus datos personales.',
        },
        {
          type: 'p',
          text: 'Para cualquier consulta relacionada con el tratamiento de tu información, puedes dirigirte a nuestro Delegado de Protección de Datos (DPO), a través de la siguiente dirección de correo electrónico: soporte.goryuz@gmail.com.',
        },
      ],
    },
    {
      title: '2. Definiciones',
      blocks: [
        {
          type: 'p',
          text: 'A continuación se precisa el significado de los términos que encontrarás a lo largo del documento:',
        },
        {
          type: 'list',
          items: [
            'Aviso de privacidad: este documento, que te informa cómo y para qué usamos tus datos personales.',
            'Base de datos: el conjunto ordenado de datos personales que guardamos, sin importar en qué formato o dónde se almacenen.',
            'Consentimiento: tu autorización libre, específica e informada para que tratemos tus datos personales.',
            'Datos personales: cualquier información que se refiera a ti y que permita identificarte, directa o indirectamente.',
            'Derechos ARCO: tus derechos de Acceso, Rectificación, Cancelación y Oposición al tratamiento de tus datos personales.',
            'Disociación: el proceso mediante el cual tus datos personales dejan de poder asociarse contigo o de permitir identificarte.',
            'Ley: la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.',
            'Reglamento: el Reglamento de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.',
            'Responsable: quien decide cómo y para qué se tratan los datos personales. Para efectos de este aviso, el Responsable es Goryuz.',
            'Tercero: cualquier persona física o moral, mexicana o extranjera, distinta de ti (el titular) y de Goryuz (el responsable).',
            'Titular: tú, la persona a quien pertenecen los datos personales.',
            'Tratamiento: cualquier operación que hagamos con tus datos personales: obtenerlos, usarlos, registrarlos, organizarlos, conservarlos, elaborarlos, utilizarlos, comunicarlos, difundirlos, almacenarlos, poseerlos, acceder a ellos, manejarlos, aprovecharlos, divulgarlos, transferirlos o disponer de ellos.',
            'Transferencia: cualquier comunicación de tus datos personales, dentro o fuera de México, a alguien distinto de ti, de Goryuz o de quien procese tus datos por encargo de Goryuz.',
          ],
        },
      ],
    },
    {
      title: '3. ¿Qué datos personales recabamos?',
      blocks: [
        {
          type: 'p',
          text: 'Para cumplir con las finalidades descritas en este aviso, recabamos las siguientes categorías de datos personales, directamente de ti, a través de la App o Sitio Web, nuestro sitio web y nuestros canales de atención:',
        },
        {
          type: 'list',
          items: [
            'Datos de identificación: nombre, fecha de nacimiento (para verificar tu mayoría de edad) y género (dato opcional).',
            'Datos de contacto: correo electrónico y, en su caso, número telefónico.',
            'Datos de tu cuenta: nombre de usuario y contraseña (almacenada de forma cifrada).',
            'Datos de inicio de sesión mediante redes sociales: si decides registrarte o iniciar sesión con Google, Facebook o Apple, dichas plataformas nos compartirán tu nombre, correo electrónico y fotografía de perfil público, conforme a la configuración de privacidad de tu cuenta. Fundamento: tu consentimiento, otorgado al autorizar el acceso desde tu propia red social.',
            'Fotografías de tus prendas y accesorios que decidas incorporar a la App o Sitio Web.',
            'Fotografías en las que apareces tú, si decides utilizarlas para visualizar los atuendos generados (por ejemplo, en la función de “probador virtual”).',
            'Datos derivados del uso de la App o Sitio Web: prendas registradas, atuendos generados mediante inteligencia artificial, preferencias de estilo, búsquedas e interacciones dentro de la plataforma.',
            'Datos de facturación y pago, en caso de contratar planes o funciones premium (procesados por un proveedor de pagos certificado; Goryuz no almacena el número completo de tu tarjeta).',
            'Datos técnicos y de geolocalización aproximada: dirección IP, identificador de tu dispositivo, sistema operativo y ubicación aproximada.',
          ],
        },
      ],
    },
    {
      title: 'Fotografías en las que apareces tú',
      isSubsection: true,
      blocks: [
        {
          type: 'p',
          text: 'Si decides incorporar fotografías en las que aparezcas tú para visualizar los atuendos generados, dichas fotografías constituyen datos personales y, dependiendo de la tecnología empleada, podrían constituir datos biométricos en caso de que se utilice reconocimiento facial para identificarte. Al incorporar este tipo de fotografías, nos otorgas tu consentimiento expreso para tratarlas exclusivamente con el fin de generar recomendaciones de atuendos y, en su caso, superponer prendas sobre tu imagen. Goryuz no utiliza estas fotografías para identificarte biométricamente frente a terceros, ni con fines distintos a los aquí descritos.',
        },
      ],
    },
    {
      title: 'Interacción con nuestro asistente virtual de soporte',
      isSubsection: true,
      blocks: [
        {
          type: 'p',
          text: 'Si te comunicas con el asistente virtual (chatbot) de atención a usuarios de Goryuz, recabaremos tu nombre de usuario, correo electrónico, el contenido de tu consulta y cualquier otro dato que decidas proporcionar por este medio. Estos datos se utilizan exclusivamente para atender y resolver tus consultas o incidencias. Fundamento: tu consentimiento previo y expreso, otorgado al iniciar la conversación.',
        },
      ],
    },
    {
      title: 'Postulación a vacantes',
      isSubsection: true,
      blocks: [
        {
          type: 'p',
          text: 'Si nos haces llegar tu candidatura para alguna vacante publicada por Goryuz, recabaremos datos de identificación, contacto, características personales, así como datos académicos y laborales (por ejemplo, a través de tu currículum). Estos datos se utilizan para evaluar tu perfil e idoneidad para el puesto correspondiente y, de manera secundaria, para integrarte a nuestra base de candidatos para futuras vacantes. Fundamento: tu consentimiento, mismo que podrás revocar en cualquier momento escribiendo a soporte.goryuz@gmail.com.',
        },
      ],
    },
    {
      title: '4. Finalidades del tratamiento de tus datos',
      blocks: [],
    },
    {
      title:
        'Finalidades primarias, necesarias para la prestación del servicio',
      isSubsection: true,
      blocks: [
        {
          type: 'list',
          items: [
            'Crear, administrar y autenticar el acceso a tu cuenta, incluyendo el inicio de sesión mediante redes sociales.',
            'Verificar tu mayoría de edad.',
            'Permitirte incorporar, organizar y clasificar las fotografías de tus prendas en tu armario digital.',
            'Generar, mediante inteligencia artificial, propuestas de atuendos a partir de las prendas que registres.',
            'Brindarte soporte a través de nuestro asistente virtual y otros canales, atender tus consultas y dar seguimiento a incidencias.',
            'Procesar tus pagos en caso de contratar funciones premium.',
            'Gestionar las candidaturas recibidas para nuestras vacantes.',
            'Enviarte avisos operativos, de seguridad o relativos a cambios en este aviso de privacidad.',
            'Dar cumplimiento a nuestras obligaciones legales, fiscales y regulatorias.',
            'Entrenar modelos de inteligencia artificial.',
          ],
        },
      ],
    },
    {
      title: 'Finalidades secundarias',
      isSubsection: true,
      blocks: [
        {
          type: 'p',
          text: 'Estas finalidades no resultan indispensables para el uso de la App o del Sitio Web, pero nos permiten ofrecerte una experiencia más personalizada. Puedes negarte a ellas sin que esto afecte el acceso a las funciones esenciales de Goryuz:',
        },
        {
          type: 'list',
          items: [
            'Enviarte publicidad, promociones, boletines y ofertas de Goryuz.',
            'Compartir tus datos con marcas y tiendas de ropa aliadas, con fines de mercadotecnia, publicidad personalizada o promociones conjuntas.',
            'Elaborar perfiles de consumo y preferencias de moda con fines comerciales o estadísticos.',
            'Invitarte a participar en encuestas, estudios de mercado o campañas de nuestros aliados comerciales.',
            'Integrarte a nuestra base de candidatos para futuras vacantes, conforme a la sección 3.3.',
          ],
        },
        {
          type: 'p',
          text: 'Puedes negarte a ellas enviando un correo electrónico a soporte.goryuz@gmail.com.',
        },
      ],
    },
    {
      title: '5. Transferencias de tus datos personales',
      blocks: [
        {
          type: 'p',
          text: 'Podemos transferir tus datos personales, únicamente en los supuestos previstos por el artículo 37 de la LFPDPPP, entre ellos:',
        },
        {
          type: 'list',
          items: [
            'A sociedades del mismo grupo corporativo que Goryuz, que operan bajo los mismos procesos y políticas internas.',
            'A proveedores que nos asisten en la operación de la App o Sitio Web (servicios de nube, mensajería, análisis de datos o procesamiento de pagos), quienes están contractualmente obligados a proteger tus datos con el mismo estándar que nosotros.',
            'A entidades financieras y bancarias, exclusivamente para procesar el pago de los servicios que contrates.',
            'A autoridades competentes, cuando exista un requerimiento legal debidamente fundado y motivado, o para la procuración o administración de justicia.',
            'En caso de que Goryuz, o sustancialmente la totalidad de sus activos, sea adquirida por un tercero (fusión, adquisición o venta del negocio), en cuyo caso tus datos formarían parte de los activos transferidos, bajo las mismas condiciones de protección previstas en este aviso.',
          ],
        },
        {
          type: 'p',
          text: 'Con tu consentimiento expreso, también podremos transferir tus datos a marcas, tiendas de ropa aliadas y proveedores de análisis de mercadotecnia, con fines publicitarios o de personalización de ofertas que pueden estar dentro o fuera de México, no obstante los datos se tratan conforme las medidas establecidas en el presente Aviso de Privacidad.',
        },
      ],
    },
    {
      title: '6. Uso de cookies y tecnologías de rastreo',
      blocks: [
        {
          type: 'p',
          text: 'La App o Sitio Web utiliza cookies, identificadores de dispositivo y tecnologías similares para mantener tu sesión activa, recordar tus preferencias, medir el uso de la App o Sitio Web y, en su caso, mostrarte publicidad personalizada. Puedes deshabilitar estas tecnologías desde la configuración de tu dispositivo o de la App o Sitio Web, si bien esto podría limitar algunas funciones.',
        },
      ],
    },
    {
      title: '7. Aviso sobre contenidos y enlaces de terceros',
      blocks: [
        {
          type: 'p',
          text: 'La App y nuestro sitio web pueden contener enlaces a sitios de terceros o contenido publicado por estos. Asimismo, para el pago de funciones premium, es posible que debas utilizar herramientas de pago proporcionadas por terceros. Goryuz no se hace responsable de las prácticas de recolección, almacenamiento y tratamiento de datos personales de dichos terceros, ni del contenido de sus sitios web. Si tienes dudas sobre el uso de tus datos por parte de un tercero, te recomendamos consultar directamente su aviso de privacidad.',
        },
      ],
    },
    {
      title: '8. Menores de edad',
      blocks: [
        {
          type: 'p',
          text: 'Goryuz está dirigido exclusivamente a personas mayores de 18 años. Al crear tu cuenta, declaras, bajo protesta de decir verdad, ser mayor de edad. Goryuz no recaba de manera intencional datos personales de menores de edad. En caso de detectar que una cuenta pertenece a un menor de edad, procederemos a suspenderla y a suprimir los datos personales asociados, conforme a la normativa aplicable.',
        },
      ],
    },
    {
      title: '9. Conservación de tus datos',
      blocks: [
        {
          type: 'p',
          text: 'Tus datos personales se conservarán únicamente durante el tiempo estrictamente necesario para cumplir la finalidad para la cual fueron recabados, o hasta que solicites su supresión o revoques el consentimiento otorgado, salvo que exista una obligación legal o contractual que impida su eliminación inmediata. Transcurrido dicho plazo, tus datos se conservarán bloqueados durante el tiempo necesario para atender responsabilidades legales, fiscales o contables y, posteriormente, serán cancelados o anonimizados, salvo que deban conservarse con fines históricos o estadísticos.',
        },
      ],
    },
    {
      title: '10. Derechos ARCO',
      blocks: [
        {
          type: 'p',
          text: 'Tienes derecho a Acceder, Rectificar y Cancelar tus datos personales, así como a Oponerte a su tratamiento (derechos ARCO), y a revocar el consentimiento que, en su caso, nos hayas otorgado. Para ejercer cualquiera de estos derechos, dirige tu solicitud a:',
        },
        {
          type: 'list',
          items: ['Correo electrónico: soporte.goryuz@gmail.com.'],
        },
        {
          type: 'p',
          text: 'Tu solicitud deberá incluir: (i) tu nombre y datos de contacto; (ii) documentos que acrediten tu identidad o, en su caso, tu representación legal; (iii) una descripción clara de los datos personales respecto de los cuales buscas ejercer alguno de los derechos ARCO; y (iv) cualquier elemento que facilite la localización de tus datos. Te responderemos en un plazo máximo de 20 días hábiles, conforme al artículo 32 de la LFPDPPP, y, de resultar procedente, haremos efectiva tu solicitud dentro de los 15 días hábiles siguientes.',
        },
        {
          type: 'p',
          text: 'Si consideras que tu derecho a la protección de datos personales ha sido vulnerado por alguna conducta u omisión de Goryuz, o presumes alguna violación a las disposiciones de la LFPDPPP, podrás presentar tu inconformidad o denuncia ante el Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI). Para mayor información, puedes consultar www.inai.org.mx.',
        },
      ],
    },
    {
      title:
        '11. Revocación del consentimiento y limitación de uso o divulgación',
      blocks: [
        {
          type: 'p',
          text: 'Puedes revocar en cualquier momento el consentimiento otorgado para las finalidades secundarias descritas en la sección 4.2, a través de la configuración de privacidad de la App o sitio web, escribiendo a soporte.goryuz@gmail.com o mediante el enlace “cancelar suscripción” disponible al calce de cada correo electrónico promocional que te enviemos. Asimismo, puedes inscribirte en el Registro Público para Evitar Publicidad (REPEP), que administra la PROFECO, con el fin de que tus datos no sean utilizados para recibir publicidad o promociones de bienes o servicios.',
        },
      ],
    },
    {
      title: '12. Medidas de seguridad',
      blocks: [
        {
          type: 'p',
          text: 'Goryuz ha implementado medidas de seguridad administrativas, técnicas y físicas para proteger tus datos personales contra daño, pérdida, alteración, destrucción, uso, acceso o tratamiento no autorizado, conforme a lo previsto por la LFPDPPP y su Reglamento. No obstante lo anterior, ninguna transmisión de información a través de internet puede considerarse absolutamente segura; en consecuencia, cualquier transmisión de datos por esta vía se realiza bajo tu propio riesgo.',
        },
      ],
    },
    {
      title: '13. Modificaciones al presente aviso de privacidad',
      blocks: [
        {
          type: 'p',
          text: 'Goryuz podrá modificar este aviso de privacidad para adaptarlo a reformas legislativas o políticas internas, avisando por www.goryuz.com/privacy, la App o al correo electrónico registrado.',
        },
      ],
    },
    {
      title: '14. Tu consentimiento',
      blocks: [
        {
          type: 'p',
          text: 'Al registrarte y utilizar Goryuz, manifiestas que has leído, entendido y aceptado los términos del presente aviso de privacidad, y otorgas tu consentimiento para el tratamiento de tus datos personales conforme a lo aquí descrito. En caso de no estar de acuerdo, te solicitamos abstenerte de utilizar la App o Sitio web.',
        },
      ],
    },
  ],
};
