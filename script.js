(() => {
  'use strict';
  const input = document.querySelector('#password');
  const toggle = document.querySelector('#toggle-visibility');
  const clear = document.querySelector('#clear-password');
  const empty = document.querySelector('#empty-state');
  const analysis = document.querySelector('#analysis');
  const common = new Set(['123456','123456789','12345678','12345','1234567','senha','password','qwerty','abc123','111111','000000','123123','admin','letmein','iloveyou','654321','passw0rd','maria123']);
  const sequences = ['0123456789','9876543210','abcdefghijklmnopqrstuvwxyz','qwertyuiop','asdfghjkl','zxcvbnm'];
  const criteria = [
    ['length','Tem comprimento adequado (12 ou mais caracteres)'],
    ['variety','Combina maiúsculas, minúsculas e números'],
    ['symbol','Inclui símbolos (ajudam, mas não garantem segurança)'],
    ['common','Não corresponde a uma senha muito comum'],
    ['pattern','Evita repetições e sequências previsíveis']
  ];
  const names = ['Muito fraca','Fraca','Razoável','Forte','Muito forte'];
  const colors = ['#d95f6b','#e28c55','#d6a23e','#55a980','#268f72'];
  function evaluate(value) {
    const lower=value.toLocaleLowerCase('pt-BR');
    const upper=/[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(value), low=/[a-záéíóúâêôãõç]/.test(value), digit=/\d/.test(value), symbol=/[^\p{L}\p{N}]/u.test(value);
    const isCommon=common.has(lower);
    const repeat=/(.)\1{2,}/u.test(lower);
    const sequence=sequences.some(seq=>{for(let i=0;i<=seq.length-4;i++)if(lower.includes(seq.slice(i,i+4)))return true;return false;});
    const keyboard=/qwerty|asdf|zxcv|qazwsx/i.test(lower), date=/(?:19|20)\d{2}|\d{2}[/-]\d{2}/.test(value);
    const predictable=repeat||sequence||keyboard||date;
    const checks={length:value.length>=12,variety:(upper&&low&&digit)||(value.length>=16&&(upper||low)&&digit),symbol,common:!isCommon,pattern:!predictable};
    const classes=[low,upper,digit,symbol].filter(Boolean).length;
    let score=0;
    if(value.length>=4)score+=8;if(value.length>=8)score+=12;if(value.length>=12)score+=19;if(value.length>=16)score+=19;if(value.length>=20)score+=12;
    score += [0,5,10,15,19][classes];
    if(isCommon)score-=45;if(predictable)score-=18;if(repeat)score-=8;if(value.length<8&&classes<=2)score-=8;
    score=Math.max(2,Math.min(100,score));
    let level=score<20?0:score<40?1:score<60?2:score<80?3:4;
    if(isCommon)level=0;if(predictable&&level>2)level--;
    return {score,level,checks,length:value.length,upper,low,digit,symbol,isCommon,predictable};
  }
  function explain(value,r) {
    const positives=[], tips=[];
    if(r.checks.length)positives.push(`o bom comprimento (${r.length} caracteres)`);else tips.push('aumente o comprimento para pelo menos 12 caracteres');
    if(r.upper&&r.low)positives.push('a combinação de maiúsculas e minúsculas');
    if(r.digit)positives.push('a presença de números');
    if(r.symbol)positives.push('o símbolo acrescenta variedade, mas sozinho não garante segurança');
    if(r.isCommon)tips.push('evite senhas muito conhecidas, como esta');
    if(r.predictable)tips.push('remova sequências, repetições ou padrões fáceis de prever');
    if(!r.checks.variety)tips.push('misture tipos de caracteres ou use palavras inesperadas');
    if(!tips.length)tips.push('continue evitando informações pessoais e padrões conhecidos');
    return (positives.length?`Ponto positivo: ${positives.join(', ')}.`:'Ainda há poucos elementos que dificultem uma tentativa de adivinhação.')+` Para melhorar: ${[...new Set(tips)].join('; ')}.`;
  }
  function render() {
    const value=input.value;
    document.querySelector('#char-count').textContent=`${value.length} ${value.length===1?'caractere':'caracteres'}`;
    clear.disabled=!value.length;
    if(!value){empty.classList.remove('hidden');analysis.classList.add('hidden');return;}
    empty.classList.add('hidden');analysis.classList.remove('hidden');
    const r=evaluate(value);
    document.querySelector('#rating-label').textContent=names[r.level];
    document.querySelector('#rating-label').style.color=colors[r.level];
    document.querySelector('#score-value').textContent=r.score;
    document.querySelector('#score-value').style.color=colors[r.level];
    document.querySelector('#score-circle').style.borderTopColor=colors[r.level];
    document.querySelector('#rating-caption').textContent=['Senha fácil de adivinhar','Precisa de mais proteção','Alguns bons elementos, com espaço para melhorar','Boa resistência estimada','Ótima combinação de comprimento e imprevisibilidade'][r.level];
    document.querySelectorAll('.strength-meter span').forEach((bar,i)=>bar.style.background=i<=r.level?colors[r.level]:'#edf0f5');
    const list=document.querySelector('#criteria-list');list.replaceChildren();let count=0;
    criteria.forEach(([key,label])=>{const li=document.createElement('li');const met=r.checks[key];if(met)count++;if(met)li.classList.add('met');const icon=document.createElement('span');icon.className='criterion-icon';icon.textContent=met?'✓':'!';const text=document.createElement('span');text.textContent=label;li.append(icon,text);list.append(li);});
    document.querySelector('#criteria-count').textContent=`${count} de 5 atendidos`;
    document.querySelector('#explanation-text').textContent=explain(value,r);
  }
  input.addEventListener('input',render);
  toggle.addEventListener('click',()=>{const show=input.type==='text';input.type=show?'password':'text';toggle.setAttribute('aria-label',show?'Mostrar senha':'Ocultar senha');toggle.title=show?'Mostrar senha':'Ocultar senha';});
  clear.addEventListener('click',()=>{input.value='';render();input.focus();});
  document.querySelectorAll('[data-example]').forEach(button=>button.addEventListener('click',()=>{input.value=button.dataset.example;input.type='password';toggle.setAttribute('aria-label','Mostrar senha');toggle.title='Mostrar senha';render();input.focus();}));
  render();
})();
