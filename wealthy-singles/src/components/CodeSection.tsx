interface CodeBlockProps {
  filename: string
  language: string
  children: React.ReactNode
}

function CodeBlock({ filename, language, children }: CodeBlockProps) {
  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-filename">{filename}</span>
        <span className="code-lang">{language}</span>
      </div>
      <div className="code-body">
        <pre>{children}</pre>
      </div>
    </div>
  )
}

export function CodeSection() {
  return (
    <div className="section">
      <h2 className="section-title">Implementation Examples</h2>
      <p className="section-desc">
        Real code snippets showing how to implement the key parts of the
        pipeline. These use freely available APIs and Python libraries.
      </p>

      <CodeBlock filename="seed_from_forbes.py" language="Python">
        <span className="cm">
          # Step 1: Seed wealthy individuals from Forbes via Wikipedia
        </span>
        {"\n"}
        <span className="kw">import</span> requests{"\n"}
        {"\n"}
        <span className="kw">def</span>{" "}
        <span className="fn">get_billionaires_from_wikipedia</span>():{"\n"}
        {"    "}
        <span className="str">
          {
            '"""Pull structured billionaire data from Wikipedia\'s Forbes list page."""'
          }
        </span>
        {"\n"}
        {"    "}url ={" "}
        <span className="str">
          &quot;https://en.wikipedia.org/w/api.php&quot;
        </span>
        {"\n"}
        {"    "}params = {"{"}
        {"\n"}
        {"        "}
        <span className="str">&quot;action&quot;</span>:{" "}
        <span className="str">&quot;parse&quot;</span>,{"\n"}
        {"        "}
        <span className="str">&quot;page&quot;</span>:{" "}
        <span className="str">
          &quot;The World&apos;s Billionaires&quot;
        </span>
        ,{"\n"}
        {"        "}
        <span className="str">&quot;prop&quot;</span>:{" "}
        <span className="str">&quot;wikitext&quot;</span>,{"\n"}
        {"        "}
        <span className="str">&quot;format&quot;</span>:{" "}
        <span className="str">&quot;json&quot;</span>
        {"\n"}
        {"    "}
        {"}"}
        {"\n"}
        {"    "}response = requests.get(url, params=params){"\n"}
        {"    "}
        <span className="kw">return</span> response.json(){"\n"}
        {"\n"}
        <span className="kw">def</span>{" "}
        <span className="fn">get_person_details</span>(name):{"\n"}
        {"    "}
        <span className="str">
          {
            '"""Get structured data for a person from Wikidata."""'
          }
        </span>
        {"\n"}
        {"    "}sparql ={" "}
        <span className="str">f&quot;&quot;&quot;</span>
        {"\n"}
        {"    "}
        <span className="str">
          {"SELECT ?person ?spouse ?networth WHERE {"}
        </span>
        {"\n"}
        {"    "}
        <span className="str">
          {'  ?person rdfs:label "{name}"@en .'}
        </span>
        {"\n"}
        {"    "}
        <span className="str">
          {"  OPTIONAL { ?person wdt:P26 ?spouse }"}
        </span>
        {"\n"}
        {"    "}
        <span className="str">
          {"  OPTIONAL { ?person wdt:P2218 ?networth }"}
        </span>
        {"\n"}
        {"    "}
        <span className="str">{"} LIMIT 1"}&quot;&quot;&quot;</span>
        {"\n"}
        {"    "}url ={" "}
        <span className="str">
          &quot;https://query.wikidata.org/sparql&quot;
        </span>
        {"\n"}
        {"    "}r = requests.get(url, params={"{"}
        <span className="str">&quot;query&quot;</span>: sparql,{" "}
        <span className="str">&quot;format&quot;</span>:{" "}
        <span className="str">&quot;json&quot;</span>
        {"}"})
        {"\n"}
        {"    "}results = r.json()[
        <span className="str">&quot;results&quot;</span>][
        <span className="str">&quot;bindings&quot;</span>]{"\n"}
        {"    "}
        <span className="kw">if</span> results:{"\n"}
        {"        "}has_spouse ={" "}
        <span className="str">&quot;spouse&quot;</span>{" "}
        <span className="kw">in</span> results[<span className="num">0</span>]
        {"\n"}
        {"        "}
        <span className="kw">return</span> {"{"}
        <span className="str">&quot;name&quot;</span>: name,{" "}
        <span className="str">&quot;likely_single&quot;</span>:{" "}
        <span className="kw">not</span> has_spouse{"}"}
        {"\n"}
        {"    "}
        <span className="kw">return</span> {"{"}
        <span className="str">&quot;name&quot;</span>: name,{" "}
        <span className="str">&quot;likely_single&quot;</span>:{" "}
        <span className="str">&quot;unknown&quot;</span>
        {"}"}
      </CodeBlock>

      <CodeBlock filename="sec_wealth_signals.py" language="Python">
        <span className="cm">
          # Step 2: Find wealthy executives via SEC EDGAR
        </span>
        {"\n"}
        <span className="kw">import</span> requests{"\n"}
        {"\n"}
        <span className="kw">def</span>{" "}
        <span className="fn">find_wealthy_insiders</span>(min_holdings=
        <span className="num">10_000_000</span>):{"\n"}
        {"    "}
        <span className="str">
          {
            '"""Query SEC EDGAR for insiders with large holdings."""'
          }
        </span>
        {"\n"}
        {"    "}base ={" "}
        <span className="str">
          &quot;https://efts.sec.gov/LATEST/search-index&quot;
        </span>
        {"\n"}
        {"    "}
        <span className="cm">
          # Search for Form 4 filings (insider transactions)
        </span>
        {"\n"}
        {"    "}headers = {"{"}
        <span className="str">&quot;User-Agent&quot;</span>:{" "}
        <span className="str">&quot;YourApp contact@email.com&quot;</span>
        {"}"}
        {"\n"}
        {"\n"}
        {"    "}
        <span className="cm">
          # Get company officers from major companies
        </span>
        {"\n"}
        {"    "}companies_url ={" "}
        <span className="str">
          &quot;https://data.sec.gov/submissions/CIK{"{cik}"}.json&quot;
        </span>
        {"\n"}
        {"\n"}
        {"    "}
        <span className="cm">
          # Parse DEF 14A proxy statements for compensation
        </span>
        {"\n"}
        {"    "}
        <span className="cm">
          {`# Look for "Total Compensation" > threshold`}
        </span>
        {"\n"}
        {"    "}
        <span className="cm"># Extract names and stock ownership values</span>
        {"\n"}
        {"    "}
        <span className="kw">pass</span>
        {"\n"}
        {"\n"}
        <span className="kw">def</span>{" "}
        <span className="fn">check_divorce_records</span>(name, state):{"\n"}
        {"    "}
        <span className="str">
          {
            '"""Check public court records for divorce filings."""'
          }
        </span>
        {"\n"}
        {"    "}
        <span className="cm">
          # Many states have online portals with search APIs
        </span>
        {"\n"}
        {"    "}
        <span className="cm">
          # PACER for federal, state-specific for state courts
        </span>
        {"\n"}
        {"    "}
        <span className="cm">
          {'# Returns: {"divorced": bool, "date": str, "source": str}'}
        </span>
        {"\n"}
        {"    "}
        <span className="kw">pass</span>
      </CodeBlock>

      <CodeBlock filename="relationship_nlp.py" language="Python">
        <span className="cm">
          # Step 4: NLP-based relationship status detection
        </span>
        {"\n"}
        <span className="kw">import</span> spacy{"\n"}
        <span className="kw">from</span> anthropic{" "}
        <span className="kw">import</span> Anthropic{"\n"}
        {"\n"}
        nlp = spacy.load(<span className="str">&quot;en_core_web_lg&quot;</span>
        ){"\n"}
        client = Anthropic(){"\n"}
        {"\n"}
        RELATIONSHIP_KEYWORDS = {"{"}
        {"\n"}
        {"    "}
        <span className="str">&quot;single&quot;</span>: [
        <span className="str">&quot;single&quot;</span>,{" "}
        <span className="str">&quot;bachelor&quot;</span>,{" "}
        <span className="str">&quot;bachelorette&quot;</span>,{" "}
        <span className="str">&quot;unmarried&quot;</span>],{"\n"}
        {"    "}
        <span className="str">&quot;married&quot;</span>: [
        <span className="str">&quot;married&quot;</span>,{" "}
        <span className="str">&quot;wife&quot;</span>,{" "}
        <span className="str">&quot;husband&quot;</span>,{" "}
        <span className="str">&quot;spouse&quot;</span>,{" "}
        <span className="str">&quot;wedding&quot;</span>],{"\n"}
        {"    "}
        <span className="str">&quot;divorced&quot;</span>: [
        <span className="str">&quot;divorced&quot;</span>,{" "}
        <span className="str">&quot;ex-wife&quot;</span>,{" "}
        <span className="str">&quot;ex-husband&quot;</span>,{" "}
        <span className="str">&quot;separation&quot;</span>],{"\n"}
        {"    "}
        <span className="str">&quot;dating&quot;</span>: [
        <span className="str">&quot;dating&quot;</span>,{" "}
        <span className="str">&quot;girlfriend&quot;</span>,{" "}
        <span className="str">&quot;boyfriend&quot;</span>,{" "}
        <span className="str">&quot;partner&quot;</span>],{"\n"}
        {"}"}
        {"\n"}
        {"\n"}
        <span className="kw">def</span>{" "}
        <span className="fn">classify_relationship_status</span>
        (person_name, articles):{"\n"}
        {"    "}
        <span className="str">
          {
            '"""Use Claude to classify relationship status from articles."""'
          }
        </span>
        {"\n"}
        {"    "}article_text ={" "}
        <span className="str">&quot;\\n---\\n&quot;</span>.join(articles[:
        <span className="num">5</span>]){"\n"}
        {"\n"}
        {"    "}msg = client.messages.create({"\n"}
        {"        "}model=
        <span className="str">
          &quot;claude-sonnet-4-20250514&quot;
        </span>
        ,{"\n"}
        {"        "}max_tokens=<span className="num">500</span>,{"\n"}
        {"        "}messages=[{"{"}
        {"\n"}
        {"            "}
        <span className="str">&quot;role&quot;</span>:{" "}
        <span className="str">&quot;user&quot;</span>,{"\n"}
        {"            "}
        <span className="str">&quot;content&quot;</span>:{" "}
        <span className="str">
          f&quot;&quot;&quot;Based on these articles about {"{person_name}"},
        </span>
        {"\n"}
        <span className="str">
          determine their relationship status.&quot;&quot;&quot;
        </span>
        {"\n"}
        {"        "}
        {"}"}]{"\n"}
        {"    "}){"\n"}
        {"    "}
        <span className="kw">return</span> json.loads(msg.content[
        <span className="num">0</span>].text)
      </CodeBlock>
    </div>
  )
}
