package KuberNSLogic

import (
	"context"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

func SetNamespace(namespace string, connectState *kubernetes.Clientset) {
	if connectState == nil {
		panic("ConnectState is nil")
	}
	nsName := &corev1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name: namespace,
		},
	}
	_, err := connectState.CoreV1().Namespaces().Create(context.Background(), nsName, metav1.CreateOptions{})
	if err != nil {
		return
	}
}
