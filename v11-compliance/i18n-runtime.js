(function(global){
  'use strict';
  const DATA=/*I18N_DATA*/null;
  let locale='zh-CN',questionLexicon=null;
  const unknown=new Set();
  const normalize=value=>String(value??'').replace(/\s+/g,' ').trim();
  const decode=value=>String(value).replace(/&(?:amp|lt|gt|quot|apos|#39|#x27|nbsp);/g,x=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&#39;':"'",'&#x27;':"'",'&nbsp;':' '})[x]);
  const escape=value=>String(value).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[x]);
  function ensureQuestions(){
    if(questionLexicon||!global.DramaAlarmQuestionBank)return;
    questionLexicon=new Map();
    const bank=global.DramaAlarmQuestionBank;
    const all=bank.listPacks().flatMap(pack=>bank.questions(pack.id));all.push(bank.getTutorial());
    for(const q of all){const tr=DATA.questions[q?.id];if(!tr)continue;
      questionLexicon.set(normalize(q.question||q.prompt),tr[0]);
      questionLexicon.set(normalize(q.explanation),tr[2]);
      q.options.forEach((option,i)=>{if(/[A-Za-z]/.test(option))questionLexicon.set(normalize(option),tr[1][i]);});
    }
  }
  const partsMap={arithmetic:'算术题',geography:'地理题',history:'历史题','everyday riddle':'生活谜题','knowledge question':'知识题',question:'题',questions:'题',hour:'小时',hours:'小时',minute:'分钟',minutes:'分钟',second:'秒',seconds:'秒'};
  function translate(value,record=true){
    const original=String(value??'');if(locale==='en')return original;
    const key=normalize(decode(original));if(!key)return original;
    const direct=DATA.ui[key];if(direct!==undefined)return direct;
    ensureQuestions();if(questionLexicon?.has(key))return questionLexicon.get(key);
    if(!/[A-Za-z]/.test(key))return key;
    let match;
    if((match=key.match(/^(Gentle|Classic|Diva)\s*[·:]\s*(\d+)\s+questions?$/)))return DATA.ui[match[1]]+' · '+match[2]+'题';
    if((match=key.match(/^(\d+)\s*[·:]\s*(Gentle|Classic|Diva)$/)))return match[1]+' · '+DATA.ui[match[2]];
    if((match=key.match(/^(\d+)\s+(arithmetic|geography|history|everyday riddle|knowledge question)$/)))return match[1]+'道'+partsMap[match[2]];
    if((match=key.match(/^(\d+)\s+questions?$/i)))return match[1]+'题';
    if((match=key.match(/^(\d+) (?:checks|Wake-up Checks) confirmed$/)))return '已确认'+match[1]+'次起床复查';
    if((match=key.match(/^(\d+) local questions are available\.$/)))return '已准备好'+match[1]+'道本地题目。';
    if((match=key.match(/^Planned release: (\d+) reviewed questions\. Current samples and future inventory are separate\.$/)))return '发布规划为'+match[1]+'道审核题，当前试用题量与未来库存分别计算。';
    if((match=key.match(/^QUESTION (\d+) OF (\d+)$/i)))return '第'+match[1]+'题，共'+match[2]+'题';
    if((match=key.match(/^(\d+)\s+of\s+(\d+)\s+questions?\s+(complete|completed)$/)))return '已完成'+match[1]+'题，共'+match[2]+'题';
    if((match=key.match(/^(\d+)\s+of\s+(\d+)\s+already complete\. No extra question is added\.$/)))return '已完成'+match[1]+'题，共'+match[2]+'题。不会增加题量。';
    if((match=key.match(/^(\d+)\s+complete(?:d)?$/)))return '已完成'+match[1]+'题';
    if((match=key.match(/^Your (\d+) completed questions? (?:is|are) safe\.$/)))return '已完成的'+match[1]+'题仍然保留。';
    if((match=key.match(/^(\d+)\s+(seconds?|minutes?|hours?)$/)))return match[1]+partsMap[match[2]];
    if((match=key.match(/^(\d+)\s*(hr|hrs|h)\s*(\d+)\s*(min|mins|m)$/)))return match[1]+'小时'+match[3]+'分';
    if((match=key.match(/^(\d+)\s*(min|mins|m)\s*(\d+)\s*(sec|secs|s)$/)))return match[1]+'分'+match[3]+'秒';
    if((match=key.match(/^(\d+)\s*(hr|hrs|h|min|mins|m|sec|secs|s)$/)))return match[1]+(/^(hr|h)/.test(match[2])?'小时':/^(min|m)/.test(match[2])?'分':'秒');
    if((match=key.match(/^(\d+)% MAX$/)))return match[1]+'% 上限';
    if((match=key.match(/^(\d+)% app gain$/)))return match[1]+'% 应用内增益';
    if((match=key.match(/^Confirm again after (\d+) minutes$/)))return match[1]+'分钟后再次确认';
    if((match=key.match(/^Wake-up Check in (\d+) minutes$/)))return match[1]+'分钟后进行起床复查';
    if((match=key.match(/^(\d+)\s+min$/)))return match[1]+'分钟';
    if((match=key.match(/^(\d+) curtain calls?$/)))return match[1]+'次谢幕';
    if((match=key.match(/^Delete (.+)\?$/)))return '删除“'+match[1]+'”？';
    if((match=key.match(/^Edit (.+)$/)))return '编辑'+match[1];
    if((match=key.match(/^Incorrect answer: (.+)$/)))return '错误答案：'+translate(match[1],record);
    if((match=key.match(/^Example: (.+)$/)))return '例题：'+translate(match[1],record);
    if((match=key.match(/^Question (\d+)$/)))return '第'+match[1]+'题';
    if((match=key.match(/^Use (.+)$/)))return '使用'+translate(match[1],record);
    if((match=key.match(/^Keep (.+)$/)))return '保留'+translate(match[1],record);
    if((match=key.match(/^Preview (.+)$/)))return '试听'+translate(match[1],record);
    if((match=key.match(/^Stop (.+)$/)))return '停止试听'+translate(match[1],record);
    if((match=key.match(/^(.+) is your stage$/)))return '已选择'+translate(match[1],record)+'主题';
    if((match=key.match(/^(.+) is ready$/)))return translate(match[1],record)+'已准备好';
    if((match=key.match(/^(.+): update unavailable\. Installed and free questions remain usable\.$/)))return translate(match[1],record)+'暂时无法更新，已安装与免费题目仍可使用。';
    if((match=key.match(/^Continue with (.+)$/)))return '继续使用'+translate(match[1],record);
    if((match=key.match(/^Next for this alarm: (.+)$/)))return '本闹钟下一次响铃：'+translate(match[1],record);
    if((match=key.match(/^Configured time: (.+)$/)))return '设定时间：'+translate(match[1],record);
    if((match=key.match(/^New alarm defaults (.+)$/)))return '新闹钟默认值'+translate(match[1],record);
    if((match=key.match(/^(\d+) local questions$/)))return match[1]+'道本地题目';
    if((match=key.match(/^(\d+) (local )?sample questions$/)))return match[1]+'道'+(match[2]?'本地':'')+'试用题';
    if((match=key.match(/^(\d+) fixed questions$/)))return match[1]+'道固定题';
    if((match=key.match(/^(\d+)-question release plan$/)))return match[1]+'道题发布规划';
    if((match=key.match(/^(.+) (enabled|paused)$/)))return match[1]+(match[2]==='enabled'?'已启用':'已暂停');
    if((match=key.match(/^(.+) (AM|PM)$/))&&/^\d/.test(match[1]))return (match[2]==='AM'?'上午':'下午')+match[1];
    if(key.includes(' · ')||key.includes(' + '))return key.split(/( · | \+ )/).map(part=>part===' · '||part===' + '?part:translate(part,record)).join('');
    if((match=key.match(/^(?:Drama Alarm|BROWSER DEMO) · ([\d.]+)$/)))return '疯狂闹钟 · '+match[1];
    if(record&&/[A-Za-z]{3}/.test(key)&&!/^(?:https?:|[A-Za-z]+:\d|\d+[.:\d]*$)/.test(key))unknown.add(key);
    return key;
  }
  function text(value){return translate(value);}
  function localizeHTML(html){
    if(locale==='en')return String(html);
    const stack=[],voidTags=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
    return String(html).replace(/<!--[\s\S]*?-->|<[^>]*>|[^<]+/g,token=>{
      const parentSkip=stack.some(entry=>entry.skip);
      if(token.startsWith('<!--'))return token;
      if(token[0]==='<'){
        const close=token.match(/^<\/([\w:-]+)/);if(close){for(let i=stack.length-1;i>=0;i--)if(stack[i].name===close[1].toLowerCase()){stack.splice(i);break;}return token;}
        const open=token.match(/^<([\w:-]+)/);if(!open)return token;const name=open[1].toLowerCase();
        const skip=parentSkip||/\bdata-i18n-ignore(?:[\s=>]|$)/i.test(token)||['script','style','code','textarea'].includes(name);
        const localized=skip?token:token.replace(/\b(aria-label|title|placeholder|alt)="([^"]*)"/g,(_,attr,value)=>attr+'="'+escape(text(decode(value)))+'"');
        if(!voidTags.has(name)&&!token.endsWith('/>'))stack.push({name,skip});return localized;
      }
      if(parentSkip||!token.trim())return token;
      const decoded=decode(token),translated=text(decoded);if(translated===normalize(decoded))return token;
      return (token.match(/^\s*/)?.[0]||'')+escape(translated)+(token.match(/\s*$/)?.[0]||'');
    });
  }
  function question(q){
    if(!q||locale==='en')return q;const tr=DATA.questions[q.id];if(!tr)return q;
    const result={...q,question:tr[0],prompt:tr[0],explanation:tr[2]};
    result.options=(q.optionIds||q.options.map((_,i)=>q.id+':'+i)).map((id,i)=>{const index=Number(String(id).split(':').at(-1));return tr[1][index]??q.options[i];});
    result.answerText=result.options[q.answer];return result;
  }
  function setLocale(value){locale=value==='en'||value==='en-US'?'en':'zh-CN';return locale;}
  function datetime(value,options){return new Intl.DateTimeFormat(locale==='en'?'en-US':'zh-CN',options).format(new Date(value));}
  const api={getLocale:()=>locale,setLocale,text,t:text,localizeHTML,question,datetime,getMissing:()=>[...unknown],clearMissing:()=>unknown.clear(),translationCount:Object.keys(DATA.ui).length,questionCount:Object.keys(DATA.questions).length};
  global.DramaAlarmI18n=Object.freeze(api);
})(typeof window==='undefined'?globalThis:window);
