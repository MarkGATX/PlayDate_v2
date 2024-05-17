'use server'

export async function AddKid(formData:FormData) {
    const rawAddKidData = {
        first_name: formData.get('first_name'),
        last_name:formData.get('last_name'),
        birthday: formData.get('birthday'),
        show_last_name: formData.get('first_name_only') === 'on'
    }

    console.log(rawAddKidData)
}