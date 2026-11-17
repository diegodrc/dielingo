# Dielingo — Planejamento

Site em React com componentes genéricos e configuráveis para criar exercícios de chinês
(inglês → chinês), no estilo dos formatos mais comuns do Duolingo, com um exemplo de
nível iniciante para cada um dos 17 tipos.

## 1. Decisões já tomadas

| Tema | Decisão |
|---|---|
| Áudio | Voz do navegador (Web Speech API, `speechSynthesis`, `zh-CN`), com modo lento (tartaruga). Sem arquivos de áudio. |
| Imagens | Cada cartão aceita um emoji **ou** uma URL de imagem. Os exemplos usam emoji. |
| Configuração | Cada questão é um objeto TypeScript/JSON tipado; uma lição é um array desses objetos. |
| Idioma | Interface e conteúdo em inglês (inglês ↔ chinês). |

Decisões técnicas que assumi (me avise se quiser mudar):

- **Stack:** Vite + React + TypeScript.
- **Estilo:** CSS Modules + variáveis CSS (sem biblioteca de UI), layout mobile-first.
- **Traçado de caracteres:** biblioteca [`hanzi-writer`](https://hanziwriter.org) (dados de traços, ordem e modo quiz prontos).
- **Testes:** Vitest + React Testing Library para a lógica de correção e as interações principais.
- **Sem backend:** tudo roda no navegador; progresso da lição fica só em memória.
- **Chinês simplificado**, pinyin com marcas de tom (nǐ hǎo).

## 2. Ideia central: 17 exercícios, 5 componentes

Os 17 tipos da lista são variações de 5 mecânicas. Cada mecânica vira um componente
genérico; o "tipo de exercício" é só uma configuração dele.

| Componente | Mecânica | Exercícios cobertos |
|---|---|---|
| `MultipleChoice` | Um enunciado + N opções, uma correta | 1.1, 1.4, 2.1, 2.2, 3.3, 4.1, 4.2, 4.3 |
| `MatchPairs` | Duas colunas embaralhadas, formar pares | 1.2, 1.3, 2.3 |
| `WordBank` | Montar frase com blocos (com distratores) | 2.4, 2.5, 3.1, 3.2 |
| `StrokeDraw` | Traçar o caractere com guia | 1.5 |
| `Story` | Texto/áudio longo intercalado com perguntas | 6.1 |

O que torna isso possível é um tipo de conteúdo único, usado em enunciados, opções,
colunas e blocos:

```ts
type Content =
  | { kind: 'text'; text: string }                       // inglês
  | { kind: 'hanzi'; hanzi: string; pinyin?: string; speak?: boolean }
  | { kind: 'audio'; speak: string }                     // botão de som, sem texto
  | { kind: 'image'; emoji?: string; src?: string; label?: string }
  | { kind: 'sentence'; tokens: Token[]; speak?: boolean } // frase com dica por palavra
  | { kind: 'chat'; lines: ChatLine[] };                 // diálogo com fala faltando
```

Um único componente `<ContentView>` sabe renderizar qualquer `Content`. Assim,
"Escolher o som certo" (2.1) é um `MultipleChoice` com enunciado `hanzi` e opções
`audio`; "Palavra nova com imagens" (1.1) é o mesmo componente com opções `image`.

### Mapeamento dos 17 tipos

| # | Exercício | Componente | Enunciado | Opções / lados |
|---|---|---|---|---|
| 1.1 | Palavra nova com imagens | MultipleChoice | hanzi + pinyin + áudio | 4 × image (grade 2×2) |
| 1.2 | Match inglês ↔ chinês | MatchPairs | — | text ↔ hanzi |
| 1.3 | Match caractere ↔ pinyin | MatchPairs | — | hanzi ↔ text (pinyin) |
| 1.4 | Escolher o significado | MultipleChoice | hanzi | text |
| 1.5 | Desenhar o caractere | StrokeDraw | hanzi | guia: completo / discreto / nenhum |
| 2.1 | Escolher o som certo | MultipleChoice | hanzi | audio |
| 2.2 | Ouvir e escolher o caractere | MultipleChoice | audio | hanzi |
| 2.3 | Match áudio ↔ caractere | MatchPairs | — | audio ↔ hanzi |
| 2.4 | Ouvir e montar em chinês | WordBank | audio (+ tartaruga) | blocos hanzi |
| 2.5 | Ouvir e traduzir | WordBank | audio (+ tartaruga) | blocos em inglês |
| 3.1 | Inglês → chinês | WordBank | text | blocos hanzi + distratores |
| 3.2 | Chinês → inglês | WordBank | sentence (dicas ao tocar) | blocos em inglês |
| 3.3 | Escolher a tradução certa | MultipleChoice | sentence ou text | 2–3 frases |
| 4.1 | Completar a lacuna | MultipleChoice | sentence com lacuna | palavras |
| 4.2 | Escolher a resposta | MultipleChoice | sentence | 2 frases |
| 4.3 | Completar o diálogo | MultipleChoice | chat | falas |
| 6.1 | Histórias | Story | linhas narradas | perguntas MultipleChoice embutidas |

(A lista original pula a seção 5; mantive a numeração dela.)

## 3. Como você vai configurar uma questão

```ts
const lesson: ExerciseConfig[] = [
  {
    type: 'multipleChoice',
    instruction: 'Select the correct image',
    prompt: { kind: 'hanzi', hanzi: '茶', pinyin: 'chá', speak: true },
    options: [
      { id: 'tea',   content: { kind: 'image', emoji: '🍵', label: 'tea' } },
      { id: 'water', content: { kind: 'image', emoji: '💧', label: 'water' } },
      { id: 'rice',  content: { kind: 'image', emoji: '🍚', label: 'rice' } },
      { id: 'apple', content: { kind: 'image', emoji: '🍎', label: 'apple' } },
    ],
    answer: 'tea',
    layout: 'grid',
  },
  {
    type: 'wordBank',
    instruction: 'Write this in Chinese',
    prompt: { kind: 'text', text: 'I drink tea' },
    answer: ['我', '喝', '茶'],
    distractors: ['你', '水'],
    tiles: { '我': 'wǒ', '喝': 'hē', '茶': 'chá', '你': 'nǐ', '水': 'shuǐ' }, // pinyin opcional
    acceptedAnswers: [],          // ordens alternativas válidas
  },
];

<Lesson exercises={lesson} onComplete={(result) => ...} />
// ou um exercício avulso:
<Exercise config={lesson[0]} onResult={(correct) => ...} />
```

Opções globais (via `<DielingoProvider>`): mostrar/ocultar pinyin, velocidade da voz,
embaralhar opções, semente de embaralhamento (para testes).

## 4. Estrutura de pastas

```
src/
  lib/
    types.ts            # Content, ExerciseConfig (união discriminada), Lesson
    speech.ts           # useSpeech(): speak(text, { slow }), detecção de voz zh-CN
    shuffle.ts          # embaralhamento com semente
    grading.ts          # funções puras de correção (testáveis)
  components/
    primitives/         # ContentView, AudioButton, HanziText, Tile, OptionCard,
                        # ChatBubble, HintPopover
    exercises/          # MultipleChoice, MatchPairs, WordBank, StrokeDraw, Story
    shell/              # Exercise (despacha pelo type), ExerciseFrame (instrução +
                        # Check/Continue + feedback), Lesson (progresso, fila de erros)
  examples/             # um arquivo de config por tipo (17) + lição completa
  pages/                # Gallery (catálogo dos 17 exemplos), LessonDemo
```

## 5. Passos de implementação

Cada passo termina com algo que roda e pode ser conferido no navegador.

1. **Scaffold** — Vite + React + TS, CSS base (tokens de cor, tipografia com fonte CJK),
   Vitest configurado, `git init`.
2. **Tipos e utilitários** — `types.ts`, `shuffle.ts`, `grading.ts` com testes unitários.
3. **Áudio** — `useSpeech` + `AudioButton` (normal e tartaruga); aviso amigável quando o
   navegador não tem voz chinesa instalada.
4. **Primitivos** — `ContentView`, `HanziText` (ruby com pinyin), `Tile`, `OptionCard`,
   `ChatBubble`, `HintPopover`.
5. **Casca do exercício** — `ExerciseFrame`: instrução, botão Check, faixa de feedback
   certo/errado com a resposta correta, botão Continue.
6. **`MultipleChoice`** — layouts lista/grade, opções de qualquer `Content`, teclas 1–4.
   Exemplos: 1.1, 1.4, 2.1, 2.2, 3.3, 4.1, 4.2, 4.3.
7. **`MatchPairs`** — seleção em duas colunas, par certo some, par errado pisca vermelho.
   Exemplos: 1.2, 1.3, 2.3.
8. **`WordBank`** — área de resposta + banco, tocar para mover/devolver, distratores,
   respostas alternativas aceitas, dicas por palavra no enunciado. Exemplos: 2.4, 2.5, 3.1, 3.2.
9. **`StrokeDraw`** — integração com `hanzi-writer` (modo quiz), três níveis de guia,
   animação de demonstração. Exemplo: 1.5.
10. **`Story`** — linhas reveladas uma a uma com áudio, perguntas de compreensão
    intercaladas (reusa `MultipleChoice`). Exemplo: 6.1.
11. **`Lesson`** — barra de progresso, questões erradas voltam ao fim da fila, tela de
    resultado.
12. **Galeria** — página inicial com os 17 exemplos agrupados pelas seções da lista, cada
    um com o exercício funcionando e o objeto de configuração ao lado; mais uma lição
    de demonstração misturando os tipos.
13. **Acabamento** — responsivo, navegação por teclado, foco/ARIA, animações, README
    explicando como criar uma questão nova.

## 6. Conteúdo dos exemplos (iniciante, ~HSK 1)

- **Vocabulário:** 你, 好, 我, 是, 不, 人, 水, 茶, 米饭, 苹果, 猫, 狗, 喝, 吃, 谢谢, 再见,
  老师, 学生, 中国, 一 a 五.
- **Tons (2.1 e 2.3):** 妈 mā / 麻 má / 马 mǎ / 骂 mà.
- **Frases:** 你好 · 我是学生 · 我喝茶 · 你喝水吗？ · 我不吃米饭 · 她是老师 · 谢谢，再见.
- **Lacuna (4.1):** 你喝茶 ___？ → 吗 (vs. 不, 是).
- **Diálogo (4.3):** A: 你好！你是老师吗？ / B: ___ → 不是，我是学生。
- **História (6.1):** conversa curta num café (pedir chá, agradecer, despedir-se) com
  2–3 perguntas de compreensão.

## 7. Limitações e riscos

- **Qualidade da voz** depende do sistema/navegador. No Windows, pode ser preciso instalar
  o pacote de voz de chinês; o site vai avisar quando não houver voz `zh-CN`.
- **Opções de áudio (2.1)** são configuradas como texto em caracteres (ex.: `speak: '麻'`),
  porque a voz do navegador lê hanzi, não pinyin. Tons isolados podem soar pouco
  naturais em algumas vozes.
- **`hanzi-writer`** baixa os dados de traços de uma CDN por padrão; posso empacotar
  localmente os caracteres dos exemplos para funcionar offline.
- **Correção do `WordBank`** é por comparação exata com `answer` / `acceptedAnswers`;
  traduções válidas não listadas contam como erro.

## 8. Fora do escopo (por enquanto)

Exercícios de fala (microfone), editor visual de questões, contas/persistência de
progresso, XP/vidas/ofensivas, backend.
