<template>
    <div class="input-container">
        <div class="modes" @click="switchMode">
            <i v-if="look" class="icon"><img src="../assets/zoom.svg"></i>
            <i v-if="add" class="icon"><img src="../assets/plus-2.svg"></i>
        </div>
        <input class="input" autofocus v-model="request" @keyup.enter="decide" placeholder="Add your task...">
    </div>
    <div class="results">
        <div v-for="item in todos" class="tasks" >
       <div :id="item.id"> {{ item.title }}: </div>
    </div>
    <div v-for="item in dataFromrequest" id="asnwers">
        <div class="to-do-item">{{ item }}</div>
    </div>
    </div>
    <div v-if="waiting">Waiting...</div>

</template>

<script>

import { Configuration, OpenAIApi } from "openai";
import store from '../../store'

const configuration = new Configuration({
    apiKey: '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',
    });

export default {
    data() {
        return {
            todos: [],
            waiting: false,
            add: true,
            look: false,
            dataFromrequest : null

        }
    },
    methods: {
        decide(e) {
            this.dataFromrequest = null;
            console.log('add is ' + this.add + 'look is ' + this.look)
            if (this.add) {
                this.addToDo(e);
                this.dataFromrequest = null;
            } else {
                console.log('getting tasks');
                const value = e.target.value.trim()
                this.todos = []
                this.getTasksOn(value)
                this.waiting = true;
            }
        },
        addToDo(e) {
            console.log(e.target.value);
            const value = e.target.value.trim()
            if (value) {
                const data = {
                id: Date.now(),
                title: value,
                completed: false,
                }
                this.todos.push(data);
                this.askGPT(data)
                console.log(data);
            } 
        },
        switchMode() {
            this.data = [];
            this.dataFromrequest = null;
            console.log('ouch');
            if (this.add) {
                this.look = true;
                this.add = false;
            } else {
                this.add = true;
                this.look = false;
            }
        },

        renderHtml(id,data) {
            const container = document.getElementById(id);
            container.innerHTML += data;
        },
        async askGPT(object){
            console.log(object)
            const openai = new OpenAIApi(configuration);
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: "Опиши 3 різними словами контекст цього речення: " + object.title,
                temperature: 0.67,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            });
            const container = document.getElementById(object.id);
            container.innerHTML += response.data.choices[0].text;
            console.log(response);
            object.response = response.data.choices[0].text;
            this.writeToFile(object);
            // store.push(object);
            return response;
        },
        async writeToFile(object) {
            const response = await fetch('http://localhost:3000/api/data/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(object)
          })
          const data = await response.json()
          console.log(data.message)
        },
        async getTasksOn(string) {
            const url = 'http://localhost:3000/api/data/' + string
            const response = await fetch(url, {
            method: 'GET',
          })
          const data = await response.json()
          console.log(data)
          this.dataFromrequest = data;
          this.waiting = false
        },
    },
    watch: {
        waiting() {  
        }
    },
    mounted() {
        console.log(store);
    }
}

</script>

<style>

.modes {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0px 16px;
    position: absolute;
    top: 54px;
    left: 24px;
}

.input-container {
   display: flex; 
}

.input {
    height: 32px;
    border-radius: 16px;
    width: 100%;
    border: 1px solid #e7e7e7;
    padding: 24px 56px;
    margin: 16px;
    font-size: 24px;
    background-color: #efefef;
}

input:active, input:focus {
  outline: none;
}

button {
    width: 120px;
    height: 56px;
    border-radius: 16px;
    position: absolute;
    right: 40px;
    top: 36px;
    font-size: 16px;
    background-color: white;
    border: 1px solid #efefef;
}

</style>