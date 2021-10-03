import axios from 'axios'

export const getReactTypes = async () => {
  try {
    const { data } = await axios.get(' https://cdn.jsdelivr.net/npm/@types/react@latest/index.d.ts')
    return data
  } catch (error) {
    console.log('Error fetching react types', error)
  }
}
