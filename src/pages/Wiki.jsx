function Wiki() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto space-y-12 pb-12">
        {/* Encabezado */}
        <div className="space-y-2 border-b border-zinc-800 pb-8">
          <h1 className="text-4xl font-bold text-white">
            Wiki de <span className="text-cyan-500">Algoritmos</span>
          </h1>
          <p className="text-xl text-zinc-400">
            Conceptos fundamentales de la teoría de grafos.
          </p>
        </div>
        
        <div className="space-y-16">
          
          {/* Sección 1: Definición Formal */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-400/10 text-cyan-400 text-sm">1</span>
              Definición Formal
            </h2>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 space-y-4">
              <p className="text-zinc-300 leading-relaxed">
                Un grafo es una estructura matemática abstracta utilizada para modelar relaciones por pares entre objetos. Formalmente, un grafo <strong className="text-white">G</strong> se define como un par ordenado <strong className="text-white">G=(V,A)</strong>, donde:
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex gap-3">
                  <span className="text-cyan-500 font-bold">•</span>
                  <span className="text-zinc-300"><strong className="text-white">V:</strong> Es un conjunto finito de elementos llamados vértices o nodos.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-cyan-500 font-bold">•</span>
                  <span className="text-zinc-300"><strong className="text-white">A:</strong> Es un conjunto de pares de vértices llamados aristas o arcos, que representan la conexión entre dos nodos.</span>
                </li>
              </ul>
            </div>
          </section>
  
          {/* Sección: Rango del Nodo */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-400/10 text-cyan-400 text-sm">i</span>
              Rango del Nodo (Grado)
            </h2>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 space-y-4">
              <p className="text-zinc-300 leading-relaxed">
                El <strong className="text-white">Grado (o Rango)</strong> de un nodo es el número de aristas que inciden en él. Es una medida fundamental de la importancia o conectividad de un nodo dentro del grafo.
              </p>
              <ul className="space-y-2 mt-4 text-zinc-300 list-disc list-inside">
                <li>En grafos <strong className="text-white">no dirigidos</strong>, es simplemente el número de conexiones.</li>
                <li>En grafos <strong className="text-white">dirigidos</strong>, se divide en:
                  <ul className="pl-6 mt-2 space-y-1 list-circle">
                    <li><strong className="text-cyan-400">Grado de entrada:</strong> Aristas que llegan al nodo.</li>
                    <li><strong className="text-cyan-400">Grado de salida:</strong> Aristas que salen del nodo.</li>
                  </ul>
                </li>
              </ul>
            </div>
          </section>
  
          {/* Sección 2: Tipos de Grafos */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-400/10 text-cyan-400 text-sm">2</span>
              Tipos de Grafos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Grafo No Dirigido */}
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
                <h3 className="text-lg font-bold text-white mb-2">Grafo No Dirigido</h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Las aristas no tienen una dirección definida. La relación es simétrica; si existe una conexión de A a B, implícitamente existe de B a A. Se representan con líneas simples.
                </p>
                <div className="bg-zinc-950 p-3 rounded text-sm text-cyan-400/90 border border-cyan-500/10">
                  <strong>Ejemplo:</strong> Una red de computadoras conectadas por cables.
                </div>
              </div>
  
              {/* Grafo Dirigido */}
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
                <h3 className="text-lg font-bold text-white mb-2">Grafo Dirigido (Dígrafo)</h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Las aristas tienen un sentido o dirección específica (de un nodo de origen a un nodo de destino). Se representan con flechas.
                </p>
                <div className="bg-zinc-950 p-3 rounded text-sm text-cyan-400/90 border border-cyan-500/10">
                  <strong>Ejemplo:</strong> Enlaces entre páginas web (A enlaza a B, pero B no necesariamente enlaza a A).
                </div>
              </div>
  
              {/* Grafo Ponderado */}
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors md:col-span-2">
                <h3 className="text-lg font-bold text-white mb-2">Grafo Ponderado (con Pesos)</h3>
                <p className="text-zinc-400 text-sm mb-4">
                  A cada arista se le asigna un valor numérico o "peso". Este valor puede representar costo, distancia, tiempo, etc.
                </p>
                <div className="bg-zinc-950 p-3 rounded text-sm text-cyan-400/90 border border-cyan-500/10">
                  <strong>Ejemplo:</strong> Un mapa de carreteras donde el peso es la distancia en kilómetros entre ciudades.
                </div>
              </div>
  
            </div>
          </section>
  
          {/* Sección 3: Representación Computacional */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-400/10 text-cyan-400 text-sm">3</span>
              Representación Computacional
            </h2>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-4">Matriz de Adyacencia</h3>
              <p className="text-zinc-300 mb-4">
                Es una matriz cuadrada <strong className="text-white">M</strong> de tamaño <strong className="text-white">n×n</strong> (donde n es el número de nodos).
              </p>
              <ul className="space-y-2 text-zinc-400 list-disc list-inside mb-6">
                <li>Si hay una conexión entre el nodo i y el nodo j, entonces <code className="text-cyan-400 bg-cyan-400/10 px-1 rounded">M[i][j]=1</code> (o el valor del peso).</li>
                <li>Si no hay conexión, <code className="text-cyan-400 bg-cyan-400/10 px-1 rounded">M[i][j]=0</code> (o infinito).</li>
              </ul>
               <div className="flex items-start gap-4 bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                  <span className="text-amber-500 font-bold">Nota:</span>
                  <p className="text-amber-200/80 text-sm">
                    Es muy eficiente para verificar la existencia de una arista (O(1)), pero consume mucha memoria (O(n²)).
                  </p>
               </div>
            </div>
          </section>
  
          {/* Video Recomendado */}
          <section className="space-y-6">
              <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-400/10 text-cyan-400 text-sm">*</span>
               Video Recomendado
            </h2>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <a href="https://www.youtube.com/watch?v=videoseries" target="_blank" rel="noopener noreferrer" className="block group">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">Teoría de grafos | Te lo explico así nomás</h3>
                  <p className="text-zinc-400 text-sm mt-2">
                      Este video explica el problema de los puentes de Königsberg (el origen de la teoría de grafos) y definiciones básicas en un español casual y digerible.
                  </p>
                   <div className="mt-4 inline-flex items-center text-sm text-cyan-500 font-medium hover:underline">
                      Ver en YouTube &rarr;
                  </div>
              </a>
            </div>
          </section>
  
  
          {/* Referencias */}

          <section className="border-t border-zinc-800 pt-12">
            <h2 className="text-xl font-bold text-white mb-6">📚 Referencias Bibliográficas</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Libros y Textos Académicos</h3>
                <ul className="space-y-4 text-sm text-zinc-400">
                  <li>
                    <p className="text-zinc-300">Gutiérrez García, I., & Zuleta Saldarriaga, Y. M. (2024).</p>
                    <em className="text-zinc-500">Introducción a la teoría de grafos: conceptos, algoritmos y aplicaciones. Editorial Universidad del Norte.</em>
                  </li>
                  <li>
                    <p className="text-zinc-300">Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2009).</p>
                    <em className="text-zinc-500">Introduction to Algorithms (3rd ed.). MIT Press. (Capítulo sobre Grafos Elementales).</em>
                  </li>
                   <li>
                    <p className="text-zinc-300">Meza H., O., & Ortega F., M. (1993).</p>
                    <em className="text-zinc-500">Grafos y Algoritmos. Editorial Equinoccio, Universidad Simón Bolívar.</em>
                  </li>
                </ul>
              </div>
  
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Recursos Web</h3>
                <ul className="space-y-2 text-sm text-cyan-500/80">
                  <li><a href="#" className="hover:text-cyan-400 hover:underline">Teoría de Grafos - Wikipedia</a></li>
                  <li><a href="#" className="hover:text-cyan-400 hover:underline">Matriz de Adyacencia - Wikipedia</a></li>
                  <li><a href="#" className="hover:text-cyan-400 hover:underline">Grafos: Representación y Recorridos - Runestone Academy</a></li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Wiki;
