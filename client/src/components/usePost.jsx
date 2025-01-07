import React from "react";

const usePost = (url, data) => {
    const [pending, setPending] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [responseData, setResponseData] = React.useState(null);

    const postData = React.useCallback(async () => {
        setPending(true);
        setError(null);

        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            withCredentials: true,
            credentials: "include"
        })
        .then(res => {
            if (!res.ok) {
                throw Error('Could not post data to the resource');
            }
            return res.json();
        })
        .then(responseJson => {
            setPending(false);
            setResponseData(responseJson);
            setError(null);
            return responseJson;
        })
        .catch(err => {
            console.log(err.message);
            setPending(false);
            setError(err.message);
            throw err;
        });
    }, [url, data]);

    return { postData, responseData, pending, error };
};

export default usePost;