import type { LegalDocument } from './types';

/**
 * Términos y Condiciones de Uso vigentes (versión del 23 de julio de 2026).
 *
 * Transcripción del documento firmado. No lo edites para "mejorar la
 * redacción": cualquier cambio de fondo tiene que venir de una versión nueva
 * del documento, y entonces se actualiza también `lastUpdated`.
 */
export const TERMS_AND_CONDITIONS: LegalDocument = {
  title: 'TÉRMINOS Y CONDICIONES DE USO',
  lastUpdated: '23 de julio de 2026',
  intro: [],
  sections: [
    {
      title: '1. Quiénes somos y cómo aceptar estos Términos',
      blocks: [
        {
          type: 'p',
          text: 'GORYUZ es una plataforma digital disponible a través de goryuz.com y de su aplicación móvil (en adelante, “GORYUZ”).',
        },
        {
          type: 'p',
          text: 'Estos Términos y Condiciones de Uso (los “Términos y Condiciones”) regulan tu acceso y uso del sitio web, la aplicación móvil, sus herramientas, contenidos y servicios relacionados (en conjunto, el “Servicio”).',
        },
        {
          type: 'p',
          text: 'Al crear una cuenta, acceder al Servicio o usar cualquiera de sus funciones, confirmas que leíste, entendiste y aceptaste estos Términos y nuestro Aviso de Privacidad. Si no estás de acuerdo, te pedimos no crear una cuenta ni utilizar GORYUZ.',
        },
        {
          type: 'p',
          text: 'No guardamos una copia individualizada de este acuerdo para cada persona que se registra, por lo que te recomendamos conservar una copia para tu expediente.',
        },
      ],
    },
    {
      title: '2. ¿Qué es GORYUZ?',
      blocks: [
        {
          type: 'p',
          text: 'GORYUZ es tu estilista virtual. Usamos herramientas de inteligencia artificial para que puedas probar prendas sobre tus propias fotos, organizar tu clóset digital y recibir ideas de estilo pensadas para ti.',
        },
        {
          type: 'p',
          text: 'También contamos con “Segunda Vida”, un espacio donde la comunidad puede publicar, comprar y vender prendas entre sí, comunicarse mediante un chat y realizar pagos a través de las herramientas habilitadas dentro de la App.',
        },
        {
          type: 'p',
          text: 'Para desbloquear algunas funciones de inteligencia artificial usamos una moneda virtual llamada “Gemas”, que puedes recibir mediante una suscripción o comprar por separado.',
        },
        {
          type: 'p',
          text: 'Seguimos mejorando GORYUZ, por lo que podemos agregar, ajustar o retirar funciones. Si un cambio afecta de manera importante un servicio que ya pagaste, te lo informaremos y respetaremos los derechos que hayas adquirido conforme a estos Términos y la legislación aplicable.',
        },
      ],
    },
    {
      title: '3. Quién puede usar GORYUZ',
      blocks: [
        {
          type: 'p',
          text: 'Para crear una cuenta y usar GORYUZ debes ser mayor de 18 años y contar con capacidad legal para contratar. Al registrarte confirmas que cumples con estos requisitos.',
        },
        {
          type: 'p',
          text: 'Podemos pedirte información o documentos razonables para verificar tu identidad, edad o la titularidad de un método de pago. Si detectamos que una cuenta pertenece a una persona menor de edad o que la información proporcionada es falsa, podremos suspenderla o cancelarla y eliminar la información correspondiente, salvo aquella que debamos conservar por obligación legal.',
        },
      ],
    },
    {
      title: '4. Tu cuenta',
      blocks: [
        {
          type: 'p',
          text: 'Para aprovechar todas las funciones de GORYUZ necesitas crear una cuenta. Tú eres responsable de mantener tus datos de acceso en un lugar seguro y de las actividades que se realicen desde tu cuenta. Si notas un uso no autorizado o una actividad que no reconozcas, avísanos de inmediato a soporte.goryuz@gmail.com.',
        },
        {
          type: 'p',
          text: 'Te pedimos que la información que nos compartas sea verdadera, completa y se mantenga actualizada. No podrás usar la identidad, datos de pago o información de otra persona sin tu autorización.',
        },
        {
          type: 'p',
          text: 'Al registrarte, aceptas que tratemos tus datos personales conforme a nuestro Aviso de Privacidad, disponible en https://goryuz.com/privacy.',
        },
        {
          type: 'p',
          text: 'Durante el registro podrás elegir si deseas recibir novedades, promociones y comunicaciones comerciales. Podrás darte de baja en cualquier momento y sin costo mediante el enlace incluido en cada correo promocional.',
        },
        {
          type: 'p',
          text: 'Nos reservamos el derecho de rechazar un registro, solicitar verificaciones adicionales, remover contenido o suspender o cancelar temporal o definitivamente una cuenta cuando detectemos información falsa, suplantación de identidad, actividades fraudulentas, falta de pago, incumplimientos a estos Términos o conductas que puedan afectar la seguridad de GORYUZ o de su comunidad.',
        },
      ],
    },
    {
      title: '5. Tus fotos y tu contenido',
      blocks: [
        {
          type: 'p',
          text: 'Para utilizar las funciones de prueba virtual, clóset digital y Segunda Vida puedes subir fotografías, descripciones, mensajes y otra información (el “Contenido del Usuario”). Tú conservas los derechos que te correspondan sobre ese contenido.',
        },
        {
          type: 'p',
          text: 'Al subir Contenido del Usuario nos das una licencia no exclusiva, gratuita, limitada, revocable y válida durante el tiempo necesario para alojarlo, procesarlo, reproducirlo, adaptarlo y transformarlo únicamente con el fin de operar y mejorar las funciones que solicites dentro de GORYUZ.',
        },
        {
          type: 'p',
          text: 'No usamos tus fotos con fines publicitarios. Es probable que utilicemos las imágenes a fin de entrenar modelos de inteligencia artificial ajenos a GORYUZ.',
        },
        {
          type: 'p',
          text: 'Al subir una foto o publicación confirmas que eres su titular o que cuentas con los permisos necesarios, y que su uso no infringe derechos de imagen, autor, propiedad industrial, privacidad o datos personales de otras personas.',
        },
        {
          type: 'p',
          text: 'Puedes solicitar la eliminación de tus fotos y de los resultados generados a partir de ellas escribiendo a soporte.goryuz@gmail.com. Atenderemos tu solicitud salvo respecto de información que debamos conservar por obligaciones legales, fiscales, contables, de seguridad o para atender una controversia.',
        },
      ],
    },
    {
      title: '6. Privacidad y seguridad',
      blocks: [
        {
          type: 'p',
          text: 'Tratamos tus datos personales conforme a nuestro Aviso de Privacidad. Ahí te explicamos qué información recabamos, para qué la usamos, con quién podemos compartirla —por ejemplo, proveedores de inteligencia artificial, alojamiento, comunicaciones y pagos— y cómo ejercer tus derechos. Puedes consultar nuestro aviso de privacidad en https://goryuz.com/privacy.',
        },
        {
          type: 'p',
          text: 'Adoptamos medidas razonables de seguridad, pero ningún sistema es completamente infalible. Tú también debes proteger tus contraseñas, dispositivos y comunicaciones, y evitar compartir información sensible con otras usuarias cuando no sea necesaria para una operación.',
        },
      ],
    },
    {
      title: '7. Gemas',
      blocks: [
        {
          type: 'p',
          text: 'Las “Gemas” son unidades virtuales que puedes usar exclusivamente dentro de GORYUZ para desbloquear funciones de inteligencia artificial u otros beneficios que se indiquen en la App. No son dinero, no tienen valor en efectivo, no generan intereses, no pueden transferirse entre cuentas ni canjearse por dinero fuera de GORYUZ.',
        },
        {
          type: 'p',
          text: 'Puedes recibir Gemas como parte de una suscripción o comprarlas por separado. La cantidad, precio y funciones disponibles se mostrarán dentro de la App antes de confirmar tu compra.',
        },
      ],
    },
    {
      title: '7.1 Gemas de suscripción',
      isSubsection: true,
      blocks: [
        {
          type: 'p',
          text: 'Las Gemas incluidas en una suscripción se acreditan conforme al plan contratado y se renuevan o vencen al cierre de cada ciclo, según se indique antes de la contratación. Las Gemas no utilizadas no se acumulan para ciclos posteriores, salvo que la App indique expresamente lo contrario.',
        },
      ],
    },
    {
      title: '7.2 Gemas adicionales',
      isSubsection: true,
      blocks: [
        {
          type: 'p',
          text: 'Las Gemas compradas por separado se mantendrán disponibles mientras tu cuenta permanezca activa, salvo que se hayan obtenido mediante fraude, error, contracargo o incumplimiento de estos Términos.',
        },
      ],
    },
    {
      title: '7.3 Orden de consumo',
      isSubsection: true,
      blocks: [
        {
          type: 'p',
          text: 'Salvo que la App indique algo distinto, primero se utilizarán las Gemas que tengan una fecha de vencimiento más próxima. El orden exacto de consumo se mostrará en la App para que puedas conocer cómo se aplicará tu saldo.',
        },
      ],
    },
    {
      title: '8. Suscripciones',
      blocks: [
        {
          type: 'p',
          text: 'GORYUZ puede ofrecer distintos planes de suscripción, incluyendo Start, Glow y Cenit. Las funciones, cantidad de Gemas, precio, periodicidad y beneficios de cada plan se mostrarán antes de que confirmes la contratación.',
        },
        {
          type: 'p',
          text: 'Las suscripciones se renuevan automáticamente por periodos iguales al contratado hasta que las canceles. Al contratar una suscripción autorizas que el precio aplicable se cargue de forma recurrente al método de pago que hayas seleccionado.',
        },
        {
          type: 'p',
          text: 'Podemos modificar el precio o los beneficios de una suscripción. Cuando el cambio sea relevante, te avisaremos con al menos 15 días naturales de anticipación por correo electrónico o dentro de la App. El cambio no afectará un ciclo ya pagado y se aplicará a partir de la siguiente renovación.',
        },
      ],
    },
    {
      title: '8.1 Cancelación',
      isSubsection: true,
      blocks: [
        {
          type: 'p',
          text: 'Puedes cancelar tu suscripción en cualquier momento desde la misma plataforma o tienda desde la que la contrataste. La cancelación detiene los cobros futuros, pero no genera por sí misma el reembolso del ciclo en curso. Seguirás disfrutando de los beneficios hasta el último día del periodo ya pagado.',
        },
        {
          type: 'p',
          text: 'Eliminar tu cuenta no necesariamente cancela una suscripción contratada mediante una tienda de aplicaciones. Antes de eliminarla, debes cancelar la renovación desde Apple App Store, Google Play o la plataforma de pago correspondiente.',
        },
      ],
    },
    {
      title: '8.2 Falta de pago',
      isSubsection: true,
      blocks: [
        {
          type: 'p',
          text: 'Si un cobro recurrente es rechazado, podemos volver a intentarlo, pedirte que actualices tu método de pago o suspender los beneficios del plan hasta que el pago sea completado. No cobraremos cantidades distintas de las que te hayan sido informadas antes de la operación.',
        },
      ],
    },
    {
      title: '9. Pagos de suscripciones y Gemas',
      blocks: [
        {
          type: 'p',
          text: 'Los pagos de suscripciones y Gemas se procesan mediante proveedores de servicios de pago o tiendas de aplicaciones. Al confirmar una compra autorizas el cargo por el precio total mostrado, incluyendo impuestos y cargos aplicables.',
        },
        {
          type: 'p',
          text: 'GORYUZ no almacena los datos completos de tu tarjeta. El procesamiento puede estar sujeto también a los términos del proveedor de pagos o de la tienda donde realices la compra.',
        },
        {
          type: 'p',
          text: 'Una compra se considera confirmada cuando el proveedor de pagos autoriza la operación y GORYUZ acredita el servicio o las Gemas correspondientes. Si el pago es rechazado, cancelado o no puede procesarse, la compra no se completará.',
        },
      ],
    },
    {
      title: '9.1 Reembolsos',
      isSubsection: true,
      blocks: [
        {
          type: 'p',
          text: 'Debido a la naturaleza digital y consumible de las Gemas, las compras de Gemas y los pagos de suscripción son finales una vez que el servicio haya sido habilitado o las Gemas hayan sido utilizadas, salvo cuando la legislación aplicable reconozca un derecho distinto.',
        },
        {
          type: 'p',
          text: 'No realizamos devoluciones únicamente por no estar conforme con un resultado visual generado por inteligencia artificial o por cambio de opinión. Sí revisaremos los casos de cobro duplicado, cargo no reconocido o falta de acreditación del servicio o las Gemas después de 24 horas. Para reportarlo, escribe a soporte.goryuz@gmail.com. Cuando proceda el reembolso, se realizará al mismo método de pago dentro de un plazo de hasta 10 días hábiles, sujeto a los tiempos de la institución financiera.',
        },
        {
          type: 'p',
          text: 'Cuando una compra se haya realizado a través de Apple App Store, Google Play u otra tienda, la solicitud de reembolso también podrá estar sujeta a las reglas y proceso de esa plataforma.',
        },
      ],
    },
    {
      title: '10. Segunda Vida',
      blocks: [
        {
          type: 'p',
          text: 'Segunda Vida es el espacio donde la comunidad de GORYUZ compra y vende prendas entre sí. Facilitamos que quien vende y quien compra se conecten a través de la App, publiquen artículos, se comuniquen mediante un chat y utilicen las herramientas de pago habilitadas para la operación.',
        },
        {
          type: 'p',
          text: 'La compraventa se celebra directamente entre la usuaria que publica el artículo (la “Vendedora”) y la usuaria que lo compra (la “Compradora”). GORYUZ no es propietaria de los artículos, no los adquiere para revenderlos y no es parte del contrato de compraventa, aunque facilite la publicación, comunicación, procesamiento del pago y atención de incidencias.',
        },
        {
          type: 'p',
          text: 'La intervención de GORYUZ en el pago o en una disputa no significa que asumamos las obligaciones de la Vendedora o la Compradora ni que garanticemos la autenticidad, calidad, legalidad, disponibilidad o estado de los artículos publicados.',
        },
        {
          type: 'p',
          text: 'GORYUZ podrá retener el Impuesto Sobre la Renta (ISR) y el Impuesto al Valor Agregado (IVA) que correspondan sobre los pagos realizados, a fin de reportarlos ante el Servicio de Administración Tributaria (SAT). Asimismo, GORYUZ podrá solicitar información adicional al respecto con el propósito de dar cumplimiento a sus obligaciones fiscales.',
        },
      ],
    },
    {
      title: '11. Publicaciones y obligaciones de las Vendedoras',
      blocks: [
        {
          type: 'p',
          text: 'Al publicar un artículo, la Vendedora se obliga a proporcionar información verdadera, clara y suficiente para que la Compradora pueda tomar una decisión informada.',
        },
        { type: 'p', text: 'La Vendedora deberá:' },
        {
          type: 'list',
          items: [
            'ser propietaria legítima del artículo o contar con autorización suficiente para venderlo;',
            'publicar fotografías actuales y representativas del artículo;',
            'describir correctamente la marca, talla, materiales, color, estado, defectos, reparaciones y cualquier característica relevante;',
            'establecer un precio real y respetar el precio confirmado en la operación;',
            'mantener disponible el artículo mientras la publicación permanezca activa;',
            'entregar o enviar el artículo dentro del plazo y bajo las condiciones informadas en la App;',
            'cumplir con las obligaciones fiscales o legales que le resulten aplicables; y',
            'cooperar razonablemente con GORYUZ cuando exista un reporte, contracargo, reclamación o investigación.',
          ],
        },
        {
          type: 'p',
          text: 'No está permitido publicar artículos falsificados, robados, obtenidos ilícitamente, peligrosos, retirados del mercado, que infrinjan derechos de terceros, cuya venta esté prohibida por la ley o para los cuales la Vendedora no cuente con los permisos necesarios.',
        },
      ],
    },
    {
      title: '12. Obligaciones de las Compradoras',
      blocks: [
        {
          type: 'p',
          text: 'Antes de comprar, la Compradora debe revisar cuidadosamente la publicación, las fotografías, la descripción, el precio, los cargos aplicables y las condiciones de entrega.',
        },
        { type: 'p', text: 'La Compradora deberá:' },
        {
          type: 'list',
          items: [
            'proporcionar información correcta para el pago y la entrega;',
            'contar con autorización para usar el método de pago seleccionado;',
            'pagar el precio y los cargos mostrados antes de confirmar la operación;',
            'recibir el artículo o coordinar su entrega conforme a lo acordado;',
            'revisar el artículo dentro del plazo que la App indique para reportar una incidencia; y',
            'no iniciar contracargos fraudulentos ni afirmar falsamente que una operación no fue autorizada.',
          ],
        },
      ],
    },
    {
      title: '13. Chat entre usuarias',
      blocks: [
        {
          type: 'p',
          text: 'GORYUZ pone a disposición de las usuarias un chat para resolver dudas y acordar detalles relacionados con una publicación, pago, entrega o incidencia.',
        },
        {
          type: 'p',
          text: 'El chat es una herramienta de comunicación. GORYUZ no participa en las conversaciones ni garantiza la exactitud de la información que las usuarias compartan. Para proteger a la comunidad, prevenir fraude, atender reportes o cumplir obligaciones legales, podremos revisar mensajes cuando exista una causa razonable y conforme a nuestro Aviso de Privacidad.',
        },
        {
          type: 'p',
          text: 'No está permitido usar el chat para acosar, amenazar, discriminar, enviar contenido sexual, compartir malware, solicitar pagos fuera de los canales habilitados, obtener datos personales innecesarios, cometer fraude o realizar actividades ilícitas.',
        },
        {
          type: 'p',
          text: 'Te recomendamos no compartir contraseñas, códigos de verificación, información bancaria completa, identificaciones o datos sensibles dentro del chat. Si una usuaria intenta llevar el pago fuera de la App, repórtalo a soporte.goryuz@gmail.com.',
        },
      ],
    },
    {
      title: '14. Precio, comisión y pagos en Segunda Vida',
      blocks: [
        {
          type: 'p',
          text: 'Antes de confirmar una operación, la App mostrará de forma clara el precio del artículo, la comisión de GORYUZ, los gastos de envío, los impuestos y cualquier otro cargo aplicable, así como el total a pagar.',
        },
        {
          type: 'p',
          text: 'Por cada operación realizada a través de Segunda Vida, GORYUZ cobrará la comisión que se muestre antes de la publicación o confirmación de la compra. La comisión podrá descontarse del importe que corresponda a la Vendedora o cobrarse a la Compradora, según se indique en la App.',
        },
        {
          type: 'p',
          text: 'Los pagos se procesarán mediante los proveedores que GORYUZ ponga a disposición. Al confirmar una compra, la Compradora autoriza el cargo por el monto total informado.',
        },
        {
          type: 'p',
          text: 'Cuando el funcionamiento de la App así lo prevea, el importe pagado podrá mantenerse temporalmente en procesamiento hasta que se confirme la entrega o venza el plazo para reportar una incidencia. Después, el monto correspondiente se pondrá a disposición de la Vendedora, descontando la comisión, impuestos, reembolsos, contracargos u otros cargos previamente informados.',
        },
        {
          type: 'p',
          text: 'La operación solo se considera confirmada cuando el proveedor de pagos autoriza y procesa el cargo. Si el pago es rechazado, cancelado o no puede procesarse, la compraventa no se completará.',
        },
        {
          type: 'p',
          text: 'La Vendedora deberá proporcionar la información bancaria, fiscal y de identificación que sea necesaria para recibir pagos y cumplir con los procesos de verificación del proveedor. GORYUZ podrá suspender la liberación de fondos cuando existan datos incompletos, una investigación de fraude, un contracargo, una reclamación pendiente o una obligación legal.',
        },
      ],
    },
    {
      title: '15. Entrega de artículos',
      blocks: [
        {
          type: 'p',
          text: 'Las modalidades, costos, plazos y condiciones de entrega disponibles se mostrarán en la App antes de confirmar la operación. Las usuarias deberán utilizar la modalidad seleccionada y conservar los comprobantes correspondientes.',
        },
        {
          type: 'p',
          text: 'La Vendedora es responsable de preparar y entregar el artículo en condiciones adecuadas, usando un empaque razonable y respetando la información proporcionada en la publicación. La Compradora es responsable de proporcionar una dirección correcta y encontrarse disponible para recibirlo.',
        },
        {
          type: 'p',
          text: 'Cuando la entrega sea realizada por una empresa de mensajería, sus tiempos y condiciones también serán aplicables. GORYUZ podrá ayudar a dar seguimiento, pero no controla directamente la operación del transportista ni responde por retrasos derivados de causas ajenas a su control, sin perjuicio de los derechos que correspondan a las usuarias.',
        },
      ],
    },
    {
      title: '16. Cancelaciones, devoluciones e incidencias de Segunda Vida',
      blocks: [
        {
          type: 'p',
          text: 'Las cancelaciones, devoluciones y reembolsos de Segunda Vida se sujetarán a las reglas que se muestren en la App antes de confirmar la operación y a la legislación aplicable.',
        },
        {
          type: 'p',
          text: 'La Compradora podrá reportar una incidencia cuando, entre otros supuestos, el artículo no sea recibido, sea sustancialmente distinto de la publicación, presente daños no informados, sea falso o exista un problema con el pago.',
        },
        {
          type: 'p',
          text: 'Para ayudarnos a revisar el caso, podremos solicitar fotografías, videos, comprobantes de entrega, comunicaciones dentro del chat y otra información razonablemente necesaria. Las usuarias deberán conservar el artículo y su empaque mientras se resuelve la incidencia.',
        },
        {
          type: 'p',
          text: 'Cuando proceda una devolución, la Compradora deberá regresar el artículo en las mismas condiciones en que lo recibió, salvo el deterioro necesario para revisarlo. El reembolso podrá efectuarse una vez que se confirme la devolución o conforme al resultado de la revisión.',
        },
        {
          type: 'p',
          text: 'GORYUZ podrá facilitar la comunicación y adoptar medidas operativas, como pausar la liberación de fondos, solicitar la devolución, cancelar la operación o procesar un reembolso. Estas medidas se tomarán con base en la información disponible y no implican que GORYUZ sea parte de la compraventa.',
        },
        {
          type: 'p',
          text: 'No procederá una devolución únicamente por cambio de opinión, talla, ajuste, color percibido o preferencia personal cuando el artículo corresponda sustancialmente con la descripción, salvo que la Vendedora haya ofrecido expresamente esa posibilidad o la legislación aplicable disponga lo contrario.',
        },
      ],
    },
    {
      title: '17. Contracargos y operaciones no autorizadas',
      blocks: [
        {
          type: 'p',
          text: 'Si detectas un cargo que no reconoces, debes informarnos de inmediato y contactar a tu institución financiera. Podemos solicitar información para investigar la operación, proteger tu cuenta y prevenir fraude.',
        },
        {
          type: 'p',
          text: 'Cuando se genere un contracargo relacionado con una venta, podremos pausar pagos pendientes, descontar el monto reclamado del saldo de la Vendedora o solicitar su reembolso, siempre que la información disponible indique que la operación está vinculada con su cuenta y sujeto a las reglas del proveedor de pagos y la legislación aplicable.',
        },
        {
          type: 'p',
          text: 'El uso abusivo o fraudulento de contracargos puede dar lugar a la suspensión o cancelación de la cuenta y a las acciones legales correspondientes.',
        },
      ],
    },
    {
      title: '18. Lo que no puedes hacer en GORYUZ',
      blocks: [
        {
          type: 'p',
          text: 'Para que GORYUZ siga siendo un espacio seguro, no está permitido:',
        },
        {
          type: 'list',
          items: [
            '1. subir contenido ilegal, difamatorio, discriminatorio, sexualmente explícito, que involucre a menores de edad o que no tengas derecho a usar;',
            '2. hacerte pasar por otra persona, crear cuentas falsas o proporcionar información engañosa;',
            '3. usar la App para cometer fraude, lavar dinero, vender artículos ilícitos o eludir obligaciones legales;',
            '4. intentar vulnerar la seguridad de la App, acceder sin permiso a otra cuenta o distribuir virus o código malicioso;',
            '5. usar bots, scraping u otras herramientas automatizadas para extraer datos, fotos o contenido sin autorización;',
            '6. hacer ingeniería inversa, descompilar, modificar o intentar replicar nuestro software o modelos de inteligencia artificial;',
            '7. revender, sublicenciar o explotar comercialmente GORYUZ o los resultados de nuestra IA sin autorización;',
            '8. manipular valoraciones, reportes, precios, pagos o funciones de la plataforma;',
            '9. contactar a otras usuarias para evitar la comisión o procesar fuera de la App una operación iniciada en Segunda Vida; o',
            '10. realizar cualquier conducta que perjudique a GORYUZ, a sus proveedores o a su comunidad.',
          ],
        },
        {
          type: 'p',
          text: 'Si incumples estas reglas, podremos remover contenido, limitar funciones, retener temporalmente fondos cuando sea legalmente procedente, suspender o cancelar tu cuenta y ejercer las acciones correspondientes.',
        },
      ],
    },
    {
      title: '19. Propiedad intelectual de GORYUZ',
      blocks: [
        {
          type: 'p',
          text: 'El diseño, software, algoritmos, modelos, bases de datos, textos, gráficos, logotipos y demás contenidos propios de GORYUZ nos pertenecen o pertenecen a quienes nos los licencian y están protegidos por la legislación aplicable.',
        },
        {
          type: 'p',
          text: 'Te damos una licencia personal, limitada, no exclusiva, revocable, intransferible y no comercial para usar la App mientras cumplas estos Términos. Esta licencia no te permite copiar, vender, sublicenciar, descompilar, extraer, modificar o crear obras derivadas de GORYUZ.',
        },
        {
          type: 'p',
          text: 'El reconocimiento de marcas en tus fotos o publicaciones se usa para organizar información o facilitar una publicación. No implica afiliación, autorización o patrocinio de esas marcas hacia GORYUZ.',
        },
        {
          type: 'p',
          text: 'Si eres titular de derechos y consideras que algún contenido se usa de manera indebida, escribe a soporte.goryuz@gmail.com e incluye información suficiente para acreditar tu titularidad e identificar el contenido. Revisaremos el reporte y, cuando corresponda, removeremos o restringiremos el contenido.',
        },
      ],
    },
    {
      title: '20. Inteligencia artificial y resultados',
      blocks: [
        {
          type: 'p',
          text: 'Los resultados generados por inteligencia artificial son aproximaciones visuales pensadas para inspirarte. No garantizan que una prenda te quedará exactamente igual en talla, color, textura, proporción o caída, y no sustituyen probarla físicamente ni revisar la información proporcionada por quien la vende.',
        },
        {
          type: 'p',
          text: 'La inteligencia artificial puede cometer errores o generar resultados inesperados. Tú debes revisar cada resultado antes de usarlo, publicarlo o tomar una decisión de compra. GORYUZ puede ajustar, reemplazar o retirar modelos y proveedores para mejorar el Servicio.',
        },
      ],
    },
    {
      title: '21. Servicios de terceros',
      blocks: [
        {
          type: 'p',
          text: 'GORYUZ utiliza servicios de terceros, como proveedores de inteligencia artificial, alojamiento, analítica, mensajería, pagos y entregas. Algunas funciones pueden estar sujetas a los términos de esos proveedores.',
        },
        {
          type: 'p',
          text: 'No controlamos la disponibilidad permanente de servicios de terceros. Cuando una falla externa afecte una operación, haremos esfuerzos razonables para ayudarte, sin perjuicio de los derechos que te correspondan conforme a la legislación aplicable.',
        },
      ],
    },
    {
      title: '22. Disponibilidad y cambios del Servicio',
      blocks: [
        {
          type: 'p',
          text: 'GORYUZ se ofrece según su disponibilidad. Podemos realizar mantenimientos, actualizaciones o cambios para mejorar la seguridad, corregir errores o incorporar nuevas funciones.',
        },
        {
          type: 'p',
          text: 'No garantizamos que el Servicio esté disponible sin interrupciones o errores. Sin embargo, procuraremos informar los mantenimientos relevantes y resolver las fallas que estén bajo nuestro control.',
        },
        {
          type: 'p',
          text: 'Si una falla generalizada de internet, proveedores de pago, servicios de inteligencia artificial, ciberataque, desastre natural, contingencia sanitaria, acto de autoridad u otra causa fuera de nuestro control afecta el Servicio, no responderemos por el retraso mientras dure dicha causa, pero buscaremos restablecer la operación razonablemente pronto.',
        },
      ],
    },
    {
      title: '23. Suspensión, cancelación y eliminación de cuenta',
      blocks: [
        {
          type: 'p',
          text: 'Puedes dejar de usar GORYUZ o solicitar la eliminación de tu cuenta en cualquier momento. Antes de eliminarla, debes completar o cancelar operaciones pendientes, retirar los saldos disponibles y cancelar cualquier suscripción recurrente.',
        },
        {
          type: 'p',
          text: 'Podremos suspender o cancelar una cuenta cuando exista un incumplimiento de estos Términos, riesgo de fraude, falta de pago, amenaza a la seguridad, requerimiento de autoridad o conducta que afecte a otras usuarias.',
        },
        {
          type: 'p',
          text: 'Cuando sea razonablemente posible y no exista un riesgo inmediato, te informaremos el motivo general de la medida y te daremos oportunidad de proporcionar información. Podremos actuar sin aviso previo cuando sea necesario para proteger a una persona, prevenir fraude, cumplir la ley o evitar daños al Servicio.',
        },
        {
          type: 'p',
          text: 'La cancelación de una cuenta no elimina las obligaciones pendientes. Podremos conservar información y fondos durante el plazo necesario para completar operaciones, atender devoluciones, contracargos, obligaciones fiscales, investigaciones o reclamaciones.',
        },
      ],
    },
    {
      title: '24. Responsabilidad',
      blocks: [
        {
          type: 'p',
          text: 'GORYUZ no garantiza la identidad, conducta o buena fe de todas las usuarias ni la autenticidad, calidad, legalidad o estado de los artículos publicados en Segunda Vida. Las usuarias deben revisar la información disponible y tomar precauciones razonables.',
        },
        {
          type: 'p',
          text: 'En la medida permitida por la ley, GORYUZ no será responsable por daños indirectos, incidentales, pérdida de oportunidades, pérdida de datos o daños derivados de acuerdos celebrados fuera de la App, uso indebido de una cuenta o incumplimientos imputables a otras usuarias o terceros.',
        },
        {
          type: 'p',
          text: 'Cuando legalmente proceda una responsabilidad directa de GORYUZ, esta se limitará al monto que hayas pagado a GORYUZ durante los tres meses anteriores al hecho que la origine. Esta limitación no aplicará cuando la ley prohíba limitar la responsabilidad, exista dolo, culpa grave o se afecten derechos irrenunciables de una persona consumidora.',
        },
        {
          type: 'p',
          text: 'Nada de lo previsto en estos Términos limita los derechos que te correspondan conforme a la legislación de protección al consumidor, datos personales u otras disposiciones obligatorias.',
        },
      ],
    },
    {
      title: '25. Responsabilidad por tu uso de GORYUZ e indemnización',
      blocks: [
        {
          type: 'p',
          text: 'Eres responsable del contenido que subas, las publicaciones que realices, los mensajes que envíes y las operaciones que celebres. Si tu conducta genera un reclamo, sanción, daño o gasto a GORYUZ por haber infringido estos Términos, la ley o derechos de terceros, deberás colaborar razonablemente y responder por los daños que te sean legalmente imputables.',
        },
        {
          type: 'p',
          text: 'Aceptas defender, indemnizar y sacar en paz y a salvo a GORYUZ, sus filiales, directivos, empleados y representantes, de cualquier reclamo, demanda, sanción, pérdida, daño, responsabilidad, costo o gasto (incluyendo honorarios razonables de abogados) que un tercero haga valer en su contra, derivado de o relacionado con: (i) tu uso indebido de la App; (ii) el contenido que publiques o los mensajes que envíes; (iii) las operaciones o acuerdos que celebres con otras usuarias; (iv) el incumplimiento de estos Términos, de la ley aplicable o de derechos de terceros; o (v) tu conducta dentro o fuera de la App relacionada con el uso de GORYUZ.',
        },
        {
          type: 'p',
          text: 'Por su parte, GORYUZ se obliga a indemnizarte y sacarte en paz y a salvo frente a reclamos de terceros que deriven directamente de un incumplimiento comprobado de estos Términos por parte de GORYUZ, dolo o culpa grave atribuible a GORYUZ, en los términos y con los límites establecidos en la Sección 24.',
        },
        {
          type: 'p',
          text: 'GORYUZ se reserva el derecho de asumir la defensa exclusiva de cualquier asunto sujeto a indemnización por tu parte, en cuyo caso te obligas a cooperar razonablemente con dicha defensa. Esta obligación de indemnización subsistirá aún después de la terminación de tu cuenta o de estos Términos.',
        },
      ],
    },
    {
      title: '26. Comunicaciones electrónicas',
      blocks: [
        {
          type: 'p',
          text: 'Aceptas que podamos enviarte avisos relacionados con tu cuenta, operaciones, seguridad, pagos y cambios relevantes a través de la App, correo electrónico u otros datos de contacto que nos proporciones.',
        },
        {
          type: 'p',
          text: 'Las comunicaciones comerciales solo se enviarán conforme a tus preferencias y podrás darte de baja en cualquier momento. Los avisos estrictamente necesarios para operar tu cuenta o cumplir obligaciones legales no se consideran promociones.',
        },
      ],
    },
    {
      title: '27. Cambios a estos Términos',
      blocks: [
        {
          type: 'p',
          text: 'Podemos actualizar estos Términos para reflejar cambios en GORYUZ, la legislación, nuestros proveedores o las medidas de seguridad.',
        },
        {
          type: 'p',
          text: 'Si hacemos un cambio importante, te lo informaremos dentro de la App o por correo antes de que entre en vigor. Los cambios no afectarán retroactivamente una compra ya confirmada ni reducirán derechos adquiridos respecto de un servicio pagado.',
        },
        {
          type: 'p',
          text: 'Cuando la ley lo permita, seguir usando GORYUZ después de la fecha indicada significará que aceptas la versión actualizada. Si no estás de acuerdo, podrás dejar de usar el Servicio y cancelar tu cuenta o suscripción.',
        },
      ],
    },
    {
      title: '28. Ley aplicable y solución de controversias',
      blocks: [
        {
          type: 'p',
          text: 'Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos.',
        },
        {
          type: 'p',
          text: 'Antes de iniciar una controversia, te invitamos a escribirnos a soporte.goryuz@gmail.com para buscar una solución.',
        },
      ],
    },
    {
      title: '29. Disposiciones generales',
      blocks: [
        {
          type: 'p',
          text: 'Si alguna disposición de estos Términos se considera inválida o inaplicable, las demás conservarán su validez. El hecho de que no ejerzamos un derecho de inmediato no significa que renunciemos a él.',
        },
        {
          type: 'p',
          text: 'No puedes ceder tu cuenta ni tus derechos bajo estos Términos sin nuestra autorización. GORYUZ podrá ceder estos Términos como parte de una reorganización, fusión, adquisición o transferencia del Servicio, siempre que ello no reduzca tus derechos.',
        },
        {
          type: 'p',
          text: 'Estos Términos, el Aviso de Privacidad y las condiciones específicas mostradas antes de una compra constituyen el acuerdo aplicable al uso de GORYUZ.',
        },
      ],
    },
    {
      title: '30. Contacto',
      blocks: [
        {
          type: 'p',
          text: 'Para cualquier pregunta, reporte o solicitud relacionada con estos Términos, contáctanos en:',
        },
        {
          type: 'list',
          items: [
            'Correo electrónico: soporte.goryuz@gmail.com',
            'Sitio web: https://goryuz.com',
          ],
        },
      ],
    },
    {
      title: '31. Procuraduría Federal de Protección al Consumidor',
      blocks: [
        {
          type: 'p',
          text: 'En caso de que el consumidor considere que sus derechos han sido violentados, podrá acudir ante la Procuraduría Federal del Consumidor (PROFECO) para presentar su queja, a través de los siguientes medios:',
        },
        {
          type: 'list',
          items: [
            'Teléfono del Consumidor: 55 5568 8722',
            'Portal en línea: www.gob.mx/profeco',
            'De manera presencial en cualquiera de sus oficinas y delegaciones a nivel nacional',
          ],
        },
        {
          type: 'p',
          text: 'Lo anterior sin perjuicio de las demás acciones legales que le correspondan conforme a la Ley Federal de Protección al Consumidor.',
        },
      ],
    },
  ],
};
