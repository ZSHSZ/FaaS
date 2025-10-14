package main

import (
	"fmt"
	"io"
	"k8s.io/client-go/rest"
	"net/http"
	"os"
	"time"
	"flag"
	"path/filepath"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
	"awesomeProject/KnativeLogic"
	"awesomeProject/KuberNSLogic"

	"k8s.io/client-go/kubernetes"
	clienKnative "knative.dev/serving/pkg/client/clientset/versioned"
)

var connectStateKuber, connectStateKnative = connect() // Во всех пакетах

/* Main connection to kuber function*/
func connect() (*kubernetes.Clientset, *clienKnative.Clientset) {
	var config *rest.Config
	var err error
	if os.Getenv("DEBUG") == "true" {
		var kubeconfig *string
		if home := homedir.HomeDir(); home != "" {
			kubeconfig = flag.String("kubeconfig", filepath.Join(home, ".kube", "config"), "(optional) absolute path to the kubeconfig file")
		} else {
			kubeconfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
		}
		flag.Parse()
		config, err = clientcmd.BuildConfigFromFlags("", *kubeconfig)
	} else {
		config, err = rest.InClusterConfig()
	}
	if err != nil {
		panic(err.Error())
	}

	// create the clientset
	clientSetKuber, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}
	clientSetKnative, err := clienKnative.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}

	return clientSetKuber, clientSetKnative
}

func createNSHandler(w http.ResponseWriter, r *http.Request) {
	t1 := time.Now()
	if r.Method == "POST" {
		body, _ := io.ReadAll(r.Body)
		receivedString := string(body)
		KuberNSLogic.SetNamespace(receivedString, connectStateKuber)
	}
	t2 := time.Now()
	fmt.Println(t2.Sub(t1))
}

func createKnativeHandler(w http.ResponseWriter, r *http.Request) {
	t1 := time.Now()
	if r.Method == "POST" {
		body, _ := io.ReadAll(r.Body)
		receivedString := string(body)
		KnativeLogic.CreateKnativeServises(receivedString, connectStateKnative)
	}
	t2 := time.Now()
	fmt.Println(t2.Sub(t1))
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/", createNSHandler)
	mux.HandleFunc("/create", createKnativeHandler)

	err := http.ListenAndServe(":3333", mux)
	if err == nil {
		fmt.Println("Listening on port 3333")
	} else {
		os.Exit(1)
	}
}
