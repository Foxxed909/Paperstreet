const ALLOWED = /^[A-Z][A-Z0-9.\-]{0,9}$/;
module.exports = async function handler(req, res) {
 const symbol=String(req.query.symbol||'AAPL').toUpperCase();
 if(!ALLOWED.test(symbol))return res.status(400).json({error:'Invalid ticker symbol.'});
 res.setHeader('Cache-Control','public, s-maxage=60, stale-while-revalidate=120');
 try{
  const response=await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1y&interval=1d`,{signal:AbortSignal.timeout(9000),headers:{'user-agent':'Paperstreet/1.0'}});
  if(!response.ok)throw Error('History unavailable');const json=await response.json(),result=json.chart?.result?.[0],rows=result?.indicators?.quote?.[0],ts=result?.timestamp||[];
  if(!rows||!ts.length)return res.status(404).json({error:'No daily bars found for this symbol.'});
  const candles=ts.map((t,i)=>({date:new Date(t*1000).toISOString().slice(0,10),open:rows.open?.[i],high:rows.high?.[i],low:rows.low?.[i],close:rows.close?.[i],volume:rows.volume?.[i]||0})).filter(x=>[x.open,x.high,x.low,x.close].every(v=>typeof v==='number'&&Number.isFinite(v)&&v>0)).slice(-260);
  if(!candles.length)return res.status(404).json({error:'No daily bars found for this symbol.'});
  const meta=result.meta||{},last=candles[candles.length-1],prev=candles[candles.length-2]||last;let price=Number(meta.regularMarketPrice)||last.close,previous=prev.close;
  let quote={price,change:price-previous,percent:(price/previous-1)*100,time:Number(meta.regularMarketTime)||null,date:last.date,source:'Yahoo Finance'};
  if(process.env.FINNHUB_API_KEY){try{const r=await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(process.env.FINNHUB_API_KEY)}`,{signal:AbortSignal.timeout(5000)});if(r.ok){const q=await r.json();if(q.c>0&&q.t>0)quote={price:q.c,change:q.d,percent:q.dp,time:q.t,source:'Finnhub'};}}catch(_){}}
  return res.status(200).json({symbol,quote,candles,historySource:'Yahoo Finance daily bars'});
 }catch(_){return res.status(502).json({error:'Market data is temporarily unavailable. Please retry.'})}
};
