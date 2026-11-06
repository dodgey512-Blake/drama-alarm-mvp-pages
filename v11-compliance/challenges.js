(function (global) {
  "use strict";
  const levels = ["Gentle", "Classic", "Diva"];
  const counts = {Gentle:1, Classic:2, Diva:3};
  const clone = value => JSON.parse(JSON.stringify(value));
  const levelOf = value => levels.includes(value) ? value : "Gentle";
  const topicOf = value => global.DramaAlarmQuestionBank?.getPack(value)?.available ? value : "everyday";
  const randomInt = (low,high,rng) => low+Math.min(high-low,Math.floor(rng()*(high-low+1)));
  function math(level="Gentle", options={}) {
    level=levelOf(level);
    const rng=options.random || Math.random;
    let a,b,op,answer;
    if(options.multiplyDivide && level!=="Gentle" && !options.basic) {
      const factor=randomInt(2,9,rng),other=randomInt(2,9,rng);
      if(rng()<.5) {a=factor;b=other;op="×";answer=a*b;}
      else {a=factor*other;b=other;op="÷";answer=factor;}
    } else {
      a=randomInt(2,level==="Gentle"?20:40,rng);
      b=randomInt(1,level==="Gentle"?15:25,rng);
      if(rng()<.5){op="+";answer=a+b;}
      else {if(a<b)[a,b]=[b,a];op="−";answer=a-b;}
    }
    return {id:`math-${options.id || Math.random().toString(36).slice(2)}`,kind:"math",a,b,op,answer,input:"",lastWrong:"",wrong:0,level};
  }
  function choice(question, options={}) {
    if(!question || !Array.isArray(question.options) || question.options.length!==4 || !Number.isInteger(question.answer) || question.answer<0 || question.answer>3) return null;
    const rng=options.random || Math.random;
    const q=clone(question);
    const rawIds=q.optionIds?.length===4?q.optionIds:q.options.map((_,i)=>`${q.id}:${i}`);
    const correct=q.correctOptionId || rawIds[q.answer];
    if(new Set(rawIds).size!==4 || !rawIds.includes(correct))return null;
    const values=q.options.map((label,i)=>({label,id:rawIds[i]}));
    for(let i=values.length-1;i>0;i--){const j=randomInt(0,i,rng);[values[i],values[j]]=[values[j],values[i]];}
    return {...q,kind:"choice",question:q.question || q.prompt,prompt:q.prompt || q.question,options:values.map(item=>item.label),optionIds:values.map(item=>item.id),correctOptionId:correct,answer:values.findIndex(item=>item.id===correct),wrong:0};
  }
  function describe(alarm={}) {
    const difficulty=levelOf(alarm.difficulty),topic=topicOf(alarm.questionTopic);
    const legacy=Number(alarm.taskPlanVersion)!==8;
    const total=legacy?(alarm.riddle===false?1:2):counts[difficulty];
    const choices=legacy?(alarm.riddle===false?0:1):(topic!=="everyday" || difficulty==="Diva"?1:0);
    const topicName=topic==="geography"?"geography":topic==="history"?"history":topic==="everyday"?"everyday riddle":"knowledge question";
    const parts=[];
    if(total-choices)parts.push(`${total-choices} arithmetic`);
    if(choices)parts.push(`${choices} ${topicName}`);
    return {difficulty,topic,total,legacy,arithmetic:total-choices,choices,composition:parts.join(" + "),label:`${difficulty} · ${total} ${total===1?"question":"questions"}`,detail:parts.join(" + ")};
  }
  function create(alarm, options={}) {
    const info=describe({...alarm,taskPlanVersion:8});
    const rng=options.random || Math.random;
    const questions=[];
    for(let index=0;index<info.total;index++) {
      const final=index===info.total-1;
      const shouldChoose=final && (info.topic!=="everyday" || info.difficulty==="Diva");
      const selected=shouldChoose?choice(options.pick?.(info.topic,info.difficulty),{random:rng}):null;
      questions.push(selected || math(info.difficulty,{random:rng,multiplyDivide:index===1,id:`${options.id || "plan"}-${index}`}));
    }
    return {version:8,id:options.id || `plan-${Date.now()}-${Math.random().toString(36).slice(2)}`,difficulty:info.difficulty,topic:info.topic,total:questions.length,completed:0,consecutiveWrong:0,mistakes:0,currentLevel:info.difficulty,questions,fallbackReason:questions.at(-1)?.kind!=="choice" && info.choices?"Content unavailable. Basic arithmetic is ready.":""};
  }
  function current(plan){return plan?.version===8 && plan.completed<plan.total?plan.questions[plan.completed]:null;}
  function progress(plan){const q=current(plan);return {completed:plan?.completed || 0,total:plan?.total || 0,questionNumber:Math.min((plan?.completed || 0)+1,plan?.total || 0),currentKind:q?.kind || null,remaining:Math.max(0,(plan?.total || 0)-(plan?.completed || 0)),complete:Boolean(plan && plan.completed>=plan.total)};}
  function replaceWithMath(plan, options={}) {
    if(!current(plan)) return false;
    plan.questions[plan.completed]=math("Gentle",{...options,basic:true,id:`${plan.id}-${plan.completed}-fallback-${plan.mistakes}`});
    plan.fallbackReason=options.reason || "Switched to basic arithmetic. You still need to answer correctly.";
    return true;
  }
  function grade(plan,answer,questionId,options={}) {
    const q=current(plan);
    if(!q || (questionId && q.id!==questionId))return {accepted:false,correct:false,complete:progress(plan).complete};
    const correct=q.kind==="math"?String(answer).trim()!=="" && Number(answer)===q.answer : Number.isInteger(answer) && q.optionIds[answer]===q.correctOptionId;
    if(correct){plan.completed+=1;plan.consecutiveWrong=0;return {accepted:true,correct:true,complete:plan.completed===plan.total,question:q};}
    plan.mistakes+=1;plan.consecutiveWrong+=1;q.wrong=(q.wrong || 0)+1;
    if(q.kind==="math"){q.lastWrong=String(answer);q.input="";}
    let downgraded=false;
    if(plan.consecutiveWrong>=3) {
      plan.currentLevel=levels[Math.max(0,levels.indexOf(levelOf(plan.currentLevel))-1)];
      for(let i=plan.completed;i<plan.total;i++){
        if(plan.questions[i].kind==="math")plan.questions[i]=math(plan.currentLevel,{random:options.random,basic:true,id:`${plan.id}-${i}-easier-${plan.mistakes}`});
        else if(i>plan.completed && plan.currentLevel==="Gentle")plan.questions[i]=math("Gentle",{random:options.random,basic:true,id:`${plan.id}-${i}-gentle-finale-${plan.mistakes}`});
      }
      if(q.kind==="choice")replaceWithMath(plan,{random:options.random,reason:"Three retries. The remaining question is now simple arithmetic."});
      plan.consecutiveWrong=0;downgraded=true;
      plan.fallbackReason="Let's make the remaining questions easier. Your completed progress is safe.";
    }
    return {accepted:true,correct:false,complete:false,downgraded,question:q};
  }
  function replaceChoice(plan,question,options={}) {
    const q=current(plan);if(!q || q.kind!=="choice")return false;
    const replacement=choice(question,options);
    if(!replacement)return replaceWithMath(plan,{...options,reason:"Topic unavailable. Answer a basic arithmetic question instead."});
    plan.questions[plan.completed]=replacement;return true;
  }
  global.DramaAlarmChallenges=Object.freeze({levels,counts,levelOf,topicOf,math,choice,describe,create,current,progress,grade,replaceWithMath,replaceChoice});
})(typeof window==="undefined"?globalThis:window);
