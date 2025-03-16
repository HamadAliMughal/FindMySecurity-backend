const approveMemory = ({collaborator ,title }: any) => `
<div style="width: 100%; text-align: center; font-family: sans-serif;max-width: 1000px; background-color: white; margin: 0 auto;border-radius: 8px; box-shadow: 0px 10px 20px 0px #00000033;">
    <div style="width: 100%; text-align: center; font-family: sans-serif; margin: 0 auto; max-width: 472px; padding: 64px 32px">
        <img src="https://dev.memvy.com/images/logo-u.png">
        <p style="font-size: 16px; line-height: 24px; font-weight: 300 color: #545353">"${collaborator}" has created a new memory for the story titled "${title}" on MEMVY, which requires your approval.</p>
    </div>
</div>
`

export default approveMemory