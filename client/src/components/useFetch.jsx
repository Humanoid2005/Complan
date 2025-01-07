import React from "react";

const useFetch = (url)=>{
    const [data,setdata] = React.useState(null);
    const [pending,setpending] = React.useState(true);
    const [error,seterror] = React.useState(null);

    React.useEffect(()=>{
        const abortcontrol = new AbortController();

        setTimeout(()=>{
            fetch(url,{withCredentials: true,credentials:"include",signal:abortcontrol.signal})
                .then(res=>{
                    if(!res.ok){
                        console.log("not ok");
                        throw Error('could not fetch data for that resource');
                    }
                    return res.json();
                })
                .then(data=>{
                    setpending(false);
                    setdata(data);
                    seterror(null);
                })
                .catch(err=>{
                    if(err.name=="AbortError"){
                        console.log("fetch aborted");
                    }
                    else{
                        console.log(err.message);
                    }
                    setpending(false);
                    seterror(err.message);
                })
        },1000);

        return ()=> abortcontrol.abort();
    },[url])

    return {data,pending,error};
}

export default useFetch;
