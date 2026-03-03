export const registerDirector = async(formData: any)=>{
    const response = await fetch('http://localhost:5000/api/auth/register-director',{
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(formData)
    });
    return response.json();
};

export const registerEmployee = async(userData: any)=>{
    const response = await fetch('http://localhost:5000/api/auth/register-employee',{
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(userData)
    });
    return response.json();
};


export const loginUser = async(credentials: any)=>{
    const response = await fetch('http://localhost:5000/api/auth/login',{
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(credentials)
    });
    const  data = await response.json();

    if(response.ok){
        //stoque le token
        localStorage.setItem('token',data.token)
    }

    return data;
}